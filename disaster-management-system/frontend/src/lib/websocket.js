import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8081/ws'

export function createStompClient(onConnect) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
    reconnectDelay: 5000,
    onConnect: () => onConnect?.(client),
  })
  client.activate()
  return client
}

export function subscribeAlerts(client, handler) {
  return client.subscribe('/topic/alerts', (msg) => handler(JSON.parse(msg.body)))
}

export function subscribeShelters(client, handler) {
  return client.subscribe('/topic/shelters', (msg) => handler(JSON.parse(msg.body)))
}

export function subscribeRescue(client, handler) {
  return client.subscribe('/topic/rescue', (msg) => handler(JSON.parse(msg.body)))
}

export function subscribeVerification(client, handler) {
  return client.subscribe('/topic/verification', (msg) => handler(JSON.parse(msg.body)))
}

export function subscribeVerificationSocial(client, handler) {
  return client.subscribe('/topic/verification-social', (msg) => handler(JSON.parse(msg.body)))
}

export function subscribeVerificationAuthoritative(client, handler) {
  return client.subscribe('/topic/verification-authoritative', (msg) => handler(JSON.parse(msg.body)))
}

export function subscribeVerificationReset(client, handler) {
  return client.subscribe('/topic/verification-reset', (msg) => handler(JSON.parse(msg.body)))
}
