import clsx from 'clsx'

export function LoadingCircle({ className }: { className?: string }) {
  return (
    <svg
      className={clsx('animate-spin h-12 w-12 text-gray-700 dark:text-gray-300', className)}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle className='opacity-50' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
      <path fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'></path>
    </svg>
  )
}
