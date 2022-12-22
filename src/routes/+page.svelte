<script>
  import { relayInit } from 'nostr-tools'
  import { WebSocket } from 'websocket-polyfill'
  if (!globalThis.WebSocket) {
    globalThis.WebSocket = WebSocket
  }
  // Prepare buffer and array to hold events
  let arr = []
  // Get events from a Nostr relay
  let damus = relayInit('wss://relay.damus.io')
  let bitSo = relayInit('wss://nostr.bitcoiner.social')

  let startDate = Math.max(Math.floor(Date.now()/1000)-604800, 1671773800)

  function getRelay() {
    return new Promise(async (resolve, reject) => {
      try {
        await damus.connect()
        damus.on('connect', () => {
          console.log(`Connected to ${damus.url}`)
          subToRelay(damus)
          return resolve(1)
        })
        damus.on('error', async () => {
          try {
            await bitSo.connect()
            bitSo.on('connect', () => {
              console.log(`Connected to ${bitSo.url}`)
              subToRelay(bitSo)
              return resolve(1)
            })
          } catch (err) {
            console.error('getRelay threw an error trying to connect to bitSo')
            return reject(err)
          }
        })
      } catch (err) {
        console.error('getRelay threw an error')
        return reject(err)
      }
    })
  }

  function subToRelay(relay) {
    let sub = relay.sub([
      {
        kinds: [1],
        authors: ['2e3e962542609b370e0441f3a45c139c7e548287d63672dd6cc0717d825703f3'],
        since: startDate
      }
    ])
    // Insert received events into array and sort them
    sub.on('event', event => {
      let parsed = JSON.parse(event.content)
      console.log(event)
      if (arr.length === 0) {
        arr.push(parsed)
        arr = arr
      } else {
        arr.push(parsed)
        arr.sort((a, b) => parseInt(b.name) - parseInt(a.name))
        arr = arr
      }
    })
    // Disconnect; no need for realtime updates
    sub.on('eose', () => {
      console.log(`Unsubscribing from ${relay.url}`)
      sub.unsub()
      relay.close()
    })
  }
  
  getRelay()
    .catch(err => {
      console.error(err)
    })

  export function getTime(name) {
    return name.substring(0,4) + '/' + name.substring(4,6) + '/' + name.substring(6,8) + ' '
          + name.substring(8,10) + ':' + name.substring(10,12) + ':' + name.substring(12,14)
  }

</script>

<h1>Blocksat Reader</h1>
    <p>Post messages by broadcasting files via Blockstream Satellite <a href="https://blockstream.com/satellite-queue/">here</a>. Supported: text, jpg/jpeg, png, gif, and pgp messages.</p>
    <p><a href="/rss.xml">RSS feed</a></p>
    <p>Now on Nostr! Our public key is <code>2e3e962542609b370e0441f3a45c139c7e548287d63672dd6cc0717d825703f3</code></p>
    <p>Here are the latest files downloaded via Blockstream Satellite API that were submitted to Nostr:</p>
    <table border="1">
      <tr>
        <th>Time received</th>
        <th>Content</th>
        <th>MIME Type</th>
      </tr>
      {#each arr as parsed}
        <tr>
          <td class="timeBox">{ getTime(parsed.name) }</td>
          <td class="contentBox">
            {#if (parsed.text === '')}
            <img src="{parsed.url}" class="satImage">
            {/if}
            {#if (parsed.url === '')}
            <p class="contentText" >{parsed.text}</p>
            {/if}
          </td>
          <td class="mimeBox">{parsed.type}</td>
        </tr>
      {/each}
      </table>

<style>
  .timeBox {
    vertical-align: text-top; padding-top: 1rem;
  }
  .contentBox {
    overflow-wrap:anywhere;
  }
  .satImage {
    max-width: 80vw;
  }
  .contentText {
    white-space: pre-wrap; text-align: left; max-width: 80vw;
  }
  .mimeBox {
    vertical-align: text-top; padding-top: 1rem;
  }

</style>