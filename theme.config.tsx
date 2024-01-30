/* eslint-disable import/no-anonymous-default-export */
import Image from 'next/image'
export default {
  logo: (
    <div className='flex gap-x-5 items-center justify-center'>
      <Image src='/logo.png' alt='logo' width={40} height={40} className='h-fit' />
      <span
        className='text-base md:text-xl lg:text-2xl font-bold dark:text-white text-black
  '
      >
        Alex Efimenko's Web Dev Journal
      </span>
    </div>
  ),

  project: {
    link: 'https://github.com/aleksandr-efimenko',
  },
  editLink: {
    component: () => null,
  },
  feedback: {
    content: () => null,
  },
  chat: {
    link: 'https://linkedin.com/in/aleksandr-efimenko/',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 24 24'
        data-supported-dps='24x24'
        fill='currentColor'
        width='32'
        height='32'
        focusable='false'
      >
        <path d='M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z'></path>
      </svg>
    ),
  },
  head: (
    <>
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <meta property='og:title' content='Blog about modern web development' />
      <meta property='og:description' content='The next site builder' />
    </>
  ),
  footer: {
    text: (
      <div>
        <p>
          This blog was built with{' '}
          <a href='https://nextra.site/' target='_blank' rel='noopener noreferrer' className='underline'>
            Nextra
          </a>{' '}
          and{' '}
          <a href='https://the-guild.dev/' target='_blank' rel='noopener noreferrer' className='underline'>
            The Guild
          </a>{' '}
          components.
        </p>
        <p>If you use material from this blog, please provide a link to the original article.</p>
      </div>
    ),
  },
}
