import { Link } from 'react-router-dom';

const Home = () => {
  const pages = [
    { path: '/aichat', title: 'AI chat' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-10">Welcome to My App</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {pages.map(({ path, title }) => (
          <Link
            key={path}
            to={path}
            className="bg-white shadow-md rounded-2xl p-8 w-64 text-center text-xl font-semibold hover:bg-blue-100 transition"
          >
            {title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
