import { BasePostMessageStream } from '@metamask/post-message-stream'


interface StreamOptions {
  name: string
  target: string
}


class LocalMessageDuplexStream extends BasePostMessageStream {
  private target: string

  constructor({ name, target }: StreamOptions) {
    super({
      name,
      target
    })
    this.target = target
  }

  protected _postMessage(data: unknown): void {
    window.postMessage(
      {
        target: this.target,
        data
      },
      '*'  // TODO: Specify origin instead of '*'
    )
  }
}


export default LocalMessageDuplexStream
