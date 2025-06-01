import { createHash } from 'crypto'

interface TranslateOptions {
  appid: string
  secretKey: string
  type: 'baidu' | 'youdao'
}

export class Translate {
  private static instance: Translate | null = null
  
  private static apiUrlsMap = {
    baidu: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
    youdao: 'https://openapi.youdao.com/api'
  }
  
  private translateApiConfig: Omit<TranslateOptions, 'type'> = {
    appid: '',
    secretKey: ''
  }
  private type: TranslateOptions['type'] = 'baidu'
  
  constructor(options: TranslateOptions) {
    if (Translate.instance) {
      return Translate.instance;
    }

    this.translateApiConfig = { 
      appid: options.appid,
      secretKey: options.secretKey
    }
    this.type = options.type

    Translate.instance = this;
  }

  public static getInstance(): Translate | null {
    return Translate.instance;
  }

  private getTranslateApiUrl(params: Record<string, string | number>): string | false {
    const url = Translate.apiUrlsMap[this.type]
    
    if(!url) {
      return false
    }
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    return `${url}?${queryString}`
  }

  private transformParams(text: string, to: string) {
    function truncate(q: string) {
      const len = q.length;
      if(len<=20) return q;
      return q.substring(0, 10) + len + q.substring(len-10, len);
    }
    
    const transformParams: Record<string, string | number> = {}
    const salt = (new Date()).getTime()

    if(this.type ==='baidu') {
      transformParams.q = text
      transformParams.from = 'auto'
      transformParams.to = to
      transformParams.appid = this.translateApiConfig.appid
      transformParams.salt = salt
      transformParams.sign = createHash('md5').update(`${this.translateApiConfig.appid}${text}${salt}${this.translateApiConfig.secretKey}`).digest('hex')
    }

    if(this.type === 'youdao') {
      const curtime = Math.round(new Date().getTime()/1000)

      transformParams.q = text
      transformParams.from = 'auto'
      transformParams.to = to
      transformParams.appKey = this.translateApiConfig.appid
      transformParams.salt = salt
      transformParams.signType = 'v3'
      transformParams.curtime = curtime
      transformParams.sign = createHash('sha256').update(`${this.translateApiConfig.appid}${truncate(text)}${salt}${curtime}${this.translateApiConfig.secretKey}`).digest('hex')
    }

    return transformParams
  }

  async translate(text: string, to: string) {
    const transformParams = this.transformParams(text, to)
    const url = this.getTranslateApiUrl(transformParams)

    if(!url) {
      console.log('translate api url is not found', url)
      return false
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const data = await response.json()

    if(this.type === 'baidu') {
      return data.trans_result[0].dst ?? false
    }

    if(this.type === 'youdao') {
      return data.translation[0] ?? false
    }

    return false
  }
}