import clsx from 'clsx'
import { Button } from 'nextra/components'
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
    <div className='w-full bg-gray-100 p-4 rounded-sm dark:bg-gray-800'>
      <div className='flex gap-2'>
        <div className='flex flex-col flex-1 items-center gap-3'>
          <h3 className='mr-2 text-lg '>Regular execution</h3>
          <Button onClick={executeWithoutDebounce}>count is {count}</Button>
        </div>
        <div className='flex flex-col flex-1 items-center gap-3'>
          <h3>Debounced execution</h3>
          <Button className={clsx(Number(countDown) < 1 && 'animate-pulse scale-150')} onClick={executeDebounced}>
            count is {count}
          </Button>
        </div>
      </div>
      <div className='w-full text-center'>
        <h4 className='text-2xl'>{countDown.replace('.', ':')}</h4>
        <h4 className='text-3xl'>Clicks: {clicks}</h4>

        <h4 className='text-3xl'>Count: {count}</h4>
        <Button className='mt-3' onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  )
}

export default function MyApp() {
  return <DebounceExample />
}
