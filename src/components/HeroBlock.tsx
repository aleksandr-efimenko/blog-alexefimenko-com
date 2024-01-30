import Image from 'next/image'

export function HeroBlock() {
  return (
    <div className='flex flex-col gap-x-5 items-center justify-center md:mt-32 md:mb-24 mt-24 mb-16'>
      <Image src='/logo.png' alt='logo' width={200} height={200} className='h-fit' />
      <h1 className='text-4xl font-bold mb-10'>Welcome to my blog!</h1>
      <span className='text-base md:text-xl lg:text-2xl font-bold dark:text-white text-black text-center'>
        I&apos;m writing about JavaScript, (Node, React, Next.js and TypeScript) or any topic I&apos;m interested in at
        the moment.
      </span>
    </div>
  )
}
