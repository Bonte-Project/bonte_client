export const MarkdownComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className='text-xl font-bold mt-4 mb-2'>{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className='text-lg font-semibold mt-3 mb-1'>{children}</h2>
  ),
  p: ({ children }: { children: React.ReactNode }) => <p className='text-sm mb-2'>{children}</p>,
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className='list-disc list-inside text-sm mb-2'>{children}</ul>
  ),
  li: ({ children }: { children: React.ReactNode }) => <li className='ml-4'>{children}</li>,
  a: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-blue-500 dark:text-blue-400 hover:underline font-medium'
    >
      {children}
    </a>
  ),
};
