import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL

    if (!webhookUrl) {
      console.error('SLACK_WEBHOOK_URL 환경 변수가 설정되지 않았습니다.')
      console.error('환경 변수 확인:', {
        hasWebhookUrl: !!process.env.SLACK_WEBHOOK_URL,
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('SLACK')),
      })
      return NextResponse.json(
        { error: 'Slack webhook URL이 설정되지 않았습니다. .env 파일에 SLACK_WEBHOOK_URL을 추가해주세요.' },
        { status: 500 }
      )
    }

    const data = await request.json()
    const { name, contact, region, source, utm_source, referrer_url } = data

    // 유입 경로 표시 로직
    const getSourceDisplay = () => {
      if (source) {
        return source
      }
      if (utm_source) {
        return utm_source
      }
      if (referrer_url && referrer_url !== 'direct') {
        try {
          const url = new URL(referrer_url)
          return url.hostname.replace('www.', '')
        } catch {
          return referrer_url
        }
      }
      return '직접 접근'
    }

    const sourceDisplay = getSourceDisplay()
    const currentTime = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Slack 메시지 포맷
    const slackMessage = {
      text: '🎉 새로운 지원자 등록',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 새로운 지원자 등록',
            emoji: true,
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*이름:*\n${name}`,
            },
            {
              type: 'mrkdwn',
              text: `*연락처:*\n${contact}`,
            },
            {
              type: 'mrkdwn',
              text: `*지역:*\n${region}`,
            },
            {
              type: 'mrkdwn',
              text: `*유입 경로:*\n${sourceDisplay}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `등록 시간: ${currentTime}`,
            },
          ],
        },
      ],
    }

    console.log('Slack webhook 호출 시작:', {
      webhookUrl: webhookUrl.substring(0, 30) + '...',
      message: slackMessage.text,
    })

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Slack webhook 호출 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        webhookUrl: webhookUrl.substring(0, 30) + '...',
      })
      return NextResponse.json(
        { 
          error: 'Slack 알림 전송에 실패했습니다.',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      )
    }

    console.log('Slack 알림 전송 성공')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Slack 알림 전송 중 오류:', error)
    return NextResponse.json(
      { error: error.message || '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

