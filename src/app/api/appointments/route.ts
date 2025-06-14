import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, getAuthHeaders, getBackendURL } from '@/config/api';
import { 
  standardizeDate, 
  parseAndStandardizeDateTime,
  DEFAULT_TIMEZONE
} from '@/utils/dateUtils';

// 获取预约列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timezone = searchParams.get('timezone') || 'Asia/Shanghai';
    
    // 构建 URL，包含查询参数
    const url = `${getBackendURL()}/appointments?timezone=${encodeURIComponent(timezone)}`;
    
    // 获取管理员或用户令牌
    const token = request.cookies.get('token')?.value || '';
    const adminToken = request.cookies.get('adminToken')?.value || '';
    const authToken = adminToken || token;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: '未授权，请登录' },
        { status: 401 }
      );
    }
    
    // 发送请求到后端
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`后端请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取预约列表失败:', error);
    return NextResponse.json(
      { success: false, message: '获取预约列表失败' },
      { status: 500 }
    );
  }
}

// 创建新预约
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      username, 
      email, 
      date, 
      service, 
      time = '19:00-21:00',
      birthDateTime,
      paymentMethod,
      timezone = DEFAULT_TIMEZONE
    } = body;
    
    // 验证必要字段
    if (!username || !service) {
      return NextResponse.json({ 
        success: false, 
        message: '预约信息不完整：缺少用户名或服务类型'
      }, { status: 400 });
    }
    
    // 对于联系请求类型，date字段可以是可选的
    if (!date && body.status !== 'contact_requested') {
      return NextResponse.json({ 
        success: false, 
        message: '预约信息不完整：缺少预约日期'
      }, { status: 400 });
    }
    
    // 获取请求中的认证头
    const authHeader = request.headers.get('authorization');
    
    // 准备请求头，优先使用客户端传递的认证信息
    const headers = {
      'Content-Type': 'application/json',
      ...(authHeader ? { 'Authorization': authHeader } : { 'Authorization': getAuthHeaders().Authorization || '' })
    };
    
    console.log('创建预约使用的认证头:', headers.Authorization || '无认证头');
    
    // 确保日期是标准格式且考虑时区
    const standardizedDate = date ? standardizeDate(date) : new Date().toISOString().split('T')[0];
    console.log(`创建预约: 原始日期=${date}, 标准化后=${standardizedDate}, 时区=${timezone}`);
    
    // 构建发送到后端的数据
    const backendData = {
      service,
      serviceDate: standardizedDate,
      timeSlot: time,
      name: username,
      email: `${username}@temp.local`, // 临时邮箱，满足后端模型要求
      price: getServicePrice(service),
      phone: body.phone || '',
      // 如果是联系请求，添加特殊状态
      ...(body.status === 'contact_requested' && {
        status: 'contact_requested',
        question: body.notes || `用户请求联系关于 ${service} 服务`
      }),
      // 添加出生信息（如果有）
      ...(birthDateTime && {
        birthDateTime: parseAndStandardizeDateTime(birthDateTime, timezone, 'UTC'),
        birthInfo: parseAndStandardizeDateTime(birthDateTime, timezone, 'UTC')
      })
    };

    console.log('发送到后端的数据:', backendData);
    
    // 通过后端API创建预约
    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(backendData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('后端创建预约失败:', errorData, '状态码:', response.status);
      return NextResponse.json({ 
        success: false, 
        message: errorData.message || '创建预约失败',
        statusCode: response.status
      }, { status: response.status });
    }
    
    const result = await response.json();
    
    // 格式化返回数据
    const newAppointment = {
      id: result.data._id,
      date,
      username,
      email,
      birthDateTime,
      service,
      time,
      status: result.data.status,
      paymentMethod,
      createdAt: result.data.createdAt
    };
    
    return NextResponse.json({
      success: true,
      data: newAppointment
    });
  } catch (error) {
    console.error('创建预约失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : '创建预约失败，服务器错误'
    }, { status: 500 });
  }
}

// 更新预约状态
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 获取令牌
    const token = request.cookies.get('token')?.value || '';
    const adminToken = request.cookies.get('adminToken')?.value || '';
    const authToken = adminToken || token;
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: '未授权，请登录' },
        { status: 401 }
      );
    }
    
    // 发送请求到后端
    const response = await fetch(`${getBackendURL()}/appointments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(data)
    });
    
    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('更新预约状态失败:', error);
    return NextResponse.json(
      { success: false, message: '更新预约状态失败' },
      { status: 500 }
    );
  }
}

// 获取服务价格
function getServicePrice(service: string): number {
  switch (service) {
    case '八字算命':
      return 618;
    case '阴盘奇门':
      return 186;
    case '大六壬':
      return 168;
    case '中国姓名':
      return 816;
    case '梅花易数':
      return 99;
    default:
      return 618;
  }
} 