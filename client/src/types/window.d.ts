import { ExternalProvider } from '@metamask/providers'

declare global {
  interface Window {
    ethereum?: ExternalProvider
  }
}
