const Header = () => {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-[#4e9045]">
            RM{" "}
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
