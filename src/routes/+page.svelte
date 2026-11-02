<script>
  import { SimplePool } from 'nostr-tools'
  // Prepare buffer and array to hold events
  let arr = []

  let startDate = Math.max(Math.floor(Date.now() / 1000) - 604800, 1671773800)

  const pool = new SimplePool()
  const relays = ['wss://relay.damus.io', 'wss://nostr.bitcoiner.social']

  function getRelay() {
    return new Promise((resolve, reject) => {
      try {
      const sub = pool.subscribe(relays,
        {
          kinds: [1],
          authors: ['2e3e962542609b370e0441f3a45c139c7e548287d63672dd6cc0717d825703f3'],
          since: startDate
        },
        {
          onevent: event => {
            let parsed = JSON.parse(event.content)
            arr = [...arr, parsed].sort((a, b) => parseInt(b.name) - parseInt(a.name))
          },
          oneose: () => {
            console.log('Got EOSE from relays')
            pool.close(relays)
            resolve(1)
          }
        }
      )
      } catch (err) {
        console.error('getRelay threw an error')
        return reject(err)
      }
    })
  }

  getRelay().catch(err => {
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
            <img src="{parsed.url}" alt="satellite transmission" class="satImage">
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
