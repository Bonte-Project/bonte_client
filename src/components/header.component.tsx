import { Link } from '@tanstack/react-router';

const Header = () => {
  return (
    <header className='p-2 flex gap-2'>
      <nav>
        <Link to='/' className='[&.active]:font-bold'>
          Home
        </Link>{' '}
        <Link to='/about' className='[&.active]:font-bold'>
          About
        </Link>
      </nav>
    </header>
  );
};

export default Header;
