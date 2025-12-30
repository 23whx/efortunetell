#!/usr/bin/env node

const { execSync } = require('child_process');

const PORT = 14761;
const isWindows = process.platform === 'win32';

console.log('=================================');
console.log('  端口清理工具');
console.log('=================================\n');

function cleanPort() {
  try {
    console.log(`正在检查端口 ${PORT}...\n`);
    
    if (isWindows) {
      const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
      const lines = output.split('\n');
      
      let cleaned = false;
      for (const line of lines) {
        const match = line.match(/LISTENING\s+(\d+)/);
        if (match) {
          const pid = match[1];
          console.log(`🔍 发现占用端口的进程 PID: ${pid}`);
          console.log(`🗑️  正在终止进程...`);
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
            console.log(`✅ 已成功终止进程 ${pid}\n`);
            cleaned = true;
          } catch (e) {
            console.log(`❌ 无法终止进程 ${pid}，可能已经停止\n`);
          }
        }
      }
      
      if (cleaned) {
        console.log(`✅ 端口 ${PORT} 已成功清理！`);
        console.log('\n💡 现在可以运行 npm run dev 启动开发服务器\n');
      } else {
        console.log(`ℹ️  端口 ${PORT} 未被占用，无需清理\n`);
      }
    } else {
      // Unix/Linux/Mac
      try {
        const output = execSync(`lsof -ti:${PORT}`, { encoding: 'utf8' }).trim();
        if (output) {
          const pids = output.split('\n');
          for (const pid of pids) {
            console.log(`🔍 发现占用端口的进程 PID: ${pid}`);
            console.log(`🗑️  正在终止进程...`);
            execSync(`kill -9 ${pid}`);
            console.log(`✅ 已成功终止进程 ${pid}\n`);
          }
          console.log(`✅ 端口 ${PORT} 已成功清理！`);
          console.log('\n💡 现在可以运行 npm run dev 启动开发服务器\n');
        } else {
          console.log(`ℹ️  端口 ${PORT} 未被占用，无需清理\n`);
        }
      } catch (e) {
        if (e.status === 1) {
          console.log(`ℹ️  端口 ${PORT} 未被占用，无需清理\n`);
        } else {
          throw e;
        }
      }
    }
  } catch (error) {
    if (error.status === 1) {
      console.log(`ℹ️  端口 ${PORT} 未被占用，无需清理\n`);
    } else {
      console.error('\n❌ 清理端口时出错:', error.message);
      console.log('\n💡 可能的解决方案：');
      console.log('   1. 以管理员身份运行终端');
      console.log('   2. 手动查看占用端口的进程：');
      if (isWindows) {
        console.log('      netstat -ano | findstr :' + PORT);
      } else {
        console.log('      lsof -i:' + PORT);
      }
      console.log('   3. 重启计算机\n');
      process.exit(1);
    }
  }
}

cleanPort();

