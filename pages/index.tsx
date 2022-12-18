import Head from 'next/head'
import { ChangeEvent, useState } from 'react'

export default function Home() {
  const [joke, setJoke] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  let prompt = ''

  function updatePrompt(e: ChangeEvent) {
    prompt = (e.target as HTMLTextAreaElement).value
  }

  function handleSubmit() {
    // dont want to nuke my openai credits
    if (fetching) return
    setFetching(true)
    fetch('api/getJoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt
      })
    }).then(res => res.json()).then(data => {
      console.log(data)
      setJoke(data.choices[0].text)
      setFetching(false)
    })
  }

  return (
    <>
      <Head>
        <title>Grinn</title>
        <meta name="description" content="Grinn, the ai comic" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-row place-content-center">
        <div className="w-3/4 md:w-2/3 lg:w-1/2 text-lg pb-20">
          <h1 className="pt-16 text-4xl font-bold">Grinn</h1>
          <h3 className="text-lg font-medium italic pb-6">the ai comic</h3>
          <div><textarea onChange={updatePrompt} className="p-5 w-full h-96 border-2 border-blue" /></div>
          <button onClick={handleSubmit} className='text-white mt-8 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
          >submit</button>
          {joke && <div>{joke}</div>}
        </div>
      </main>
    </>
  )
}
