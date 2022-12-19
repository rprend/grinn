import Head from 'next/head'
import { ChangeEvent, useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { Alert } from 'flowbite-react'
import { HiInformationCircle } from "react-icons/hi";

const QOUTA_LIMIT = 1000

export default function Home() {
  const [joke, setJoke] = useState<string | null>(null)
  const [quota, setQuota] = useState<number | null>(null)
  const [fetching, setFetching] = useState(false)
  let prompt = ''

  const { data: session } = useSession()

  function updatePrompt(e: ChangeEvent) {
    prompt = (e.target as HTMLTextAreaElement).value
  }

  function getQuota() {
    if (!session || !session.user) return

    fetch('api/getUsage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: session.user.email
      })
    }).then(res => res.json()).then(data => {
      setQuota(data.body.total_tokens / QOUTA_LIMIT)
    })
  }

  function incrementQuota(tokens: number) {
    if (!session || !session.user) return

    fetch('api/incrementRedis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: session.user.email,
        tokens
      })
    }).then(res => res.json()).then(() => {
      getQuota()
    })
  }

  function handleSubmit() {
    // dont want to nuke my openai credits
    if (fetching || maxedOut()) return
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
      setJoke(data.choices[0].text)
      incrementQuota(data.usage.total_tokens)
      setFetching(false)
    })
  }

  function maxedOut(): boolean {
    return quota != null && (quota >= 1)
  }

  // Get quota on load
  if (session) {
    getQuota()
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
          <div className="mt-5">
            {!session &&
            <>
            <Alert color="warning" icon={HiInformationCircle} className='mb-5'>You must be authorized to submit (no stealing my gpt credits)</Alert>
            <div className="flex flex-row justify-between">
              <button onClick={() => signIn()} className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign In</button>
              <button onClick={handleSubmit} data-tooltip-target="tooltip-default" className='text-gray-900 disabled:opacity-50 bg-sky-700 disabled:hover:bg-gradient-to-r bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2'
              disabled>submit</button>
            </div>
            </>
            }
            {session &&
            <>
            {!quota && <Alert color="gray" icon={HiInformationCircle} className='mb-5'>Usage this month: loading...</Alert>}
            {quota && !maxedOut() && <Alert color="gray" icon={HiInformationCircle} className='mb-5'>Usage this month: {quota * 100}%</Alert>}
            {quota && maxedOut() && <Alert color="failure" icon={HiInformationCircle} className='mb-5'>You have reached your monthly limit of {process.env.QOUTA_LIMIT} tokens</Alert>}
            <div className="flex flex-row justify-between">
              <button onClick={() => signOut()} className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign Out</button>
              <button onClick={handleSubmit} data-tooltip-target="tooltip-default" className='text-gray-900 disabled:opacity-50 bg-sky-700 disabled:hover:bg-gradient-to-r bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2'
              disabled={fetching || maxedOut()}>submit</button>
            </div>
            </>
            }
          </div>
          {joke && <div>{joke}</div>}
        </div>
      </main>
    </>
  )
}
