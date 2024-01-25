// Example from https://beta.reactjs.org/learn
import { useState, useRef } from 'react'

const WAIT_INTERVAL = 1000

function DebounceExample() {
  const [count, setCount] = useState(0)
  const [clicks, setClicks] = useState(0)

  const initialWaitInterval = (WAIT_INTERVAL / 1000).toFixed(2)
  const [countDown, setCountDown] = useState(initialWaitInterval)

  const intervalId = useRef<null | number | NodeJS.Timeout>(null)
  const timeoutId = useRef<null | number | NodeJS.Timeout>(null)

  function executeWithoutDebounce() {
    setClicks((clicks) => clicks + 1)
    setCount((count) => count + 1)
  }

  function executeDebounced() {
    setClicks((clicks) => clicks + 1)
    // Reset the countdown to the initial value if it's not already at the initial value
    if (intervalId.current !== null) {
      clearInterval(intervalId.current)
      setCountDown(initialWaitInterval)
    }
    intervalId.current = setInterval(() => {
      setCountDown((timer) => (Number(timer) - 0.01 <= 0 ? 0 : Number(timer) - 0.01).toFixed(2))
    }, 10)

    if (timeoutId.current !== null) {
      clearTimeout(timeoutId.current)
    }
    timeoutId.current = setTimeout(() => {
      setCount((count) => count + 1)
      setCountDown(initialWaitInterval)
      if (intervalId.current !== null) {
        clearInterval(intervalId.current)
      }
    }, WAIT_INTERVAL)
  }

  function reset() {
    setCount(0)
    setClicks(0)
    setCountDown(initialWaitInterval)
    if (intervalId.current !== null) {
      clearInterval(intervalId.current)
    }
    if (timeoutId.current !== null) {
      clearTimeout(timeoutId.current)
    }
  }

  return (
    <>
      <div className='flex gap-2'>
        <div className='flex-'>
          <h3>Regular execution</h3>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={executeWithoutDebounce}
          >
            count is {count}
          </button>
        </div>
        <div className='flex-ite='>
          <h3>Debounced execution</h3>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
            onClick={executeDebounced}
          >
            count is {count}
          </button>
        </div>
      </div>
      <h3>{countDown.replace('.', ':')}</h3>
      <h3>Clicks: {clicks}</h3>
      <button onClick={reset}>Reset</button>
    </>
  )
}

export default function MyApp() {
  return <DebounceExample />
}
