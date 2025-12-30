#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

const PORT = 14761;
const isWindows = process.platform === 'win32';

// 创建 readline 接口用于交互
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 询问用户输入
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

// 检查端口是否被占用（不清理）
function checkPortInUse() {
  try {
    if (isWindows) {
      const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
      const lines = output.split('\n');
      
      const pids = [];
      for (const line of lines) {
        const match = line.match(/LISTENING\s+(\d+)/);
        if (match) {
          pids.push(match[1]);
        }
      }
      
      return pids.length > 0 ? { inUse: true, pids } : { inUse: false };
    } else {
      // Unix/Linux/Mac
      const output = execSync(`lsof -ti:${PORT}`, { encoding: 'utf8' }).trim();
      if (output) {
        const pids = output.split('\n');
        return { inUse: true, pids };
      }
      return { inUse: false };
    }
  } catch (error) {
    if (error.status === 1) {
      return { inUse: false };
    }
    throw error;
  }
}

// 清理端口上的进程
function cleanPort(silent = false) {
  try {
    if (!silent) {
      console.log(`正在清理端口 ${PORT}...`);
    }
    
    if (isWindows) {
      const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
      const lines = output.split('\n');
      
      let cleaned = false;
      for (const line of lines) {
        const match = line.match(/LISTENING\s+(\d+)/);
        if (match) {
          const pid = match[1];
          if (!silent) {
            console.log(`终止进程 PID: ${pid}...`);
          }
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
            if (!silent) {
              console.log(`✓ 已终止进程 ${pid}`);
            }
            cleaned = true;
          } catch (e) {
            if (!silent) {
              console.log(`× 无法终止进程 ${pid}`);
            }
          }
        }
      }
      
      if (cleaned && !silent) {
        console.log(`✓ 端口 ${PORT} 已清理\n`);
      }
    } else {
      // Unix/Linux/Mac
      const output = execSync(`lsof -ti:${PORT}`, { encoding: 'utf8' }).trim();
      if (output) {
        const pids = output.split('\n');
        for (const pid of pids) {
          if (!silent) {
            console.log(`终止进程 PID: ${pid}...`);
          }
          execSync(`kill -9 ${pid}`);
          if (!silent) {
            console.log(`✓ 已终止进程 ${pid}`);
          }
        }
        if (!silent) {
          console.log(`✓ 端口 ${PORT} 已清理\n`);
        }
      }
    }
    
    return true;
  } catch (error) {
    if (error.status !== 1) {
      if (!silent) {
        console.error('❌ 清理端口时出错:', error.message);
      }
      return false;
    }
    return true;
  }
}

// 启动开发服务器
function startDevServer() {
  console.log('正在启动开发服务器...\n');
  
  const devProcess = spawn('npm', ['run', 'dev:direct'], {
    stdio: ['inherit', 'inherit', 'pipe'],
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  // 监听错误输出，检测端口占用
  let stderrData = '';
  devProcess.stderr.on('data', (data) => {
    const output = data.toString();
    stderrData += output;
    process.stderr.write(data);
    
    // 检测端口占用错误
    if (output.includes('EADDRINUSE') || output.includes('address already in use')) {
      console.error('\n❌ 错误：端口 ' + PORT + ' 已被占用！\n');
      console.log('💡 解决方案：');
      console.log('   1. 运行以下命令清理端口：');
      console.log('      npm run clean-port');
      console.log('   2. 然后重新启动开发服务器：');
      console.log('      npm run dev\n');
      console.log('   或者直接重新运行 npm run dev（脚本会自动尝试清理）\n');
    }
  });

  // 处理进程退出
  devProcess.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.log(`\n开发服务器异常退出 (code: ${code}, signal: ${signal})`);
      
      // 如果是因为端口占用导致的退出，显示提示
      if (stderrData.includes('EADDRINUSE') || stderrData.includes('address already in use')) {
        console.log('\n💡 提示：端口可能仍被占用，可以运行以下命令清理：');
        console.log('   npm run clean-port\n');
      }
    } else {
      console.log(`\n开发服务器已停止`);
    }
    cleanPort(true);
    process.exit(code || 0);
  });

  // 捕获当前进程的终止信号
  const signals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  signals.forEach(signal => {
    process.on(signal, () => {
      console.log(`\n收到 ${signal} 信号，正在清理...`);
      devProcess.kill(signal);
    });
  });

  // Windows特定：捕获Ctrl+C
  if (isWindows) {
    process.on('SIGBREAK', () => {
      console.log('\n收到 SIGBREAK 信号，正在清理...');
      devProcess.kill('SIGTERM');
    });
  }

  // 在程序退出前清理
  process.on('exit', () => {
    console.log('清理进程...');
    cleanPort(true);
  });

  // 捕获未处理的错误
  process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    devProcess.kill('SIGTERM');
    cleanPort(true);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    devProcess.kill('SIGTERM');
    cleanPort(true);
    process.exit(1);
  });
}

// 主函数
async function main() {
  console.log('=================================');
  console.log('  开发服务器启动脚本');
  console.log('=================================\n');
  
  // 检查端口是否被占用
  console.log(`正在检查端口 ${PORT}...`);
  const portStatus = checkPortInUse();
  
  if (portStatus.inUse) {
    // 端口被占用，询问用户
    console.log(`\n⚠️  警告：端口 ${PORT} 正在被使用！`);
    console.log(`发现以下进程占用端口：`);
    portStatus.pids.forEach(pid => {
      console.log(`  - PID: ${pid}`);
    });
    console.log('');
    
    const answer = await askQuestion('是否清理端口并重新启动？(Y/n): ');
    
    if (answer === 'y' || answer === 'yes' || answer === '') {
      console.log('');
      const cleaned = cleanPort(false);
      
      if (!cleaned) {
        console.error('\n❌ 清理端口失败\n');
        console.log('💡 你可以：');
        console.log('   1. 以管理员身份运行终端');
        console.log('   2. 手动运行: npm run clean-port');
        console.log('   3. 重启计算机\n');
        rl.close();
        process.exit(1);
      }
      
      // 等待端口完全释放
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✓ 端口已清理，准备启动...\n');
    } else {
      console.log('\n取消启动。');
      console.log('\n💡 提示：如果需要清理端口，可以运行：');
      console.log('   npm run clean-port\n');
      rl.close();
      process.exit(0);
    }
  } else {
    console.log(`✓ 端口 ${PORT} 未被占用\n`);
  }
  
  // 关闭 readline 接口
  rl.close();
  
  // 显示提示信息
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log('│  💡 提示：如果遇到端口占用问题，可以运行：          │');
  console.log('│     npm run clean-port                              │');
  console.log('└─────────────────────────────────────────────────────┘\n');
  
  // 启动开发服务器
  startDevServer();
}

main().catch(error => {
  console.error('\n❌ 启动失败:', error.message);
  console.log('\n💡 如果是端口占用问题，请运行：');
  console.log('   npm run clean-port');
  console.log('   npm run dev\n');
  rl.close();
  process.exit(1);
});

