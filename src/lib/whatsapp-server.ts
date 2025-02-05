import { createBot } from 'whatsapp-cloud-api'

class WhatsAppServer {
  private static instance: WhatsAppServer
  private bot: any | null = null
  private initPromise: Promise<any> | null = null

  private constructor() {}

  public static getInstance(): WhatsAppServer {
    if (!WhatsAppServer.instance) {
      WhatsAppServer.instance = new WhatsAppServer()
    }
    return WhatsAppServer.instance
  }

  public async getBot() {
    if (this.bot) {
      return this.bot
    }

    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        const from = process.env.WHATSAPP_PHONE_NUMBER_ID
        const token = process.env.WHATSAPP_TOKEN

        if (!from || !token) {
          throw new Error('Missing WhatsApp credentials')
        }

        this.bot = createBot(from, token)
        resolve(this.bot)
      } catch (error) {
        console.error('Error initializing WhatsApp bot:', error)
        reject(error)
      }
    })

    return this.initPromise
  }

  public async sendMessage(to: string, text: string) {
    try {
      const bot = await this.getBot()
      await bot.sendText(to, text)
      return true
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return false
    }
  }
}

export const whatsappServer = WhatsAppServer.getInstance() 