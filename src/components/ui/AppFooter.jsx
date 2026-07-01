export default function AppFooter({ variant = 'default' }) {
  const isFloating = variant === 'floating';

  return (
    <footer
      className={`w-full text-center text-xs sm:text-sm font-semibold text-text-secondary ${
        isFloating
          ? 'absolute bottom-4 left-0 right-0 z-10 px-4'
          : 'px-4 pb-6 pt-2'
      }`}
    >
      <p className="m-0 text-current">
        Proyecto realizado por{' '}
        <a
          href="https://portfolio-alpha-lilac-34.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary font-black rounded-md px-1 transition-all duration-200 hover:bg-brand-primary/10 hover:text-brand-hover"
        >
          Anastasio Nieves
        </a>
        {' '}y{' '}
        <a
          href="https://pamelavazquez-dev.github.io/portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary font-black rounded-md px-1 transition-all duration-200 hover:bg-brand-primary/10 hover:text-brand-hover"
        >
          Pamela Vazquez
        </a>
       ©
      </p>
    </footer>
  );
}
