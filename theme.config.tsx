/* eslint-disable import/no-anonymous-default-export */
export default {
  logo: (
    <span
      className='text-2xl font-bold dark:text-white text-black
  '
    >
      Alex's blog
    </span>
  ),

  project: {
    link: 'https://github.com/aleksandr-efimenko/blog-alexefimenko-com',
  },
  editLink: {
    component: () => null,
  },
  feedback: {
    content: () => null,
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
      <>
        <div className='flex flex-col items-center justify-center'>
          <div className='flex items-center justify-center'>
            <a href='https://nextra.site/' target='_blank' rel='noopener noreferrer'>
              This blog was built with Nextra
            </a>
            <span className='mx-2'>•</span>
            and
            <span className='mx-2'>•</span>
            <a href='https://the-guild.dev/' target='_blank' rel='noopener noreferrer'>
              The Guild components
            </a>
          </div>
        </div>
      </>
    ),
  },
}
