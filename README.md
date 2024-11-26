# StackConnect

StackConnect is a platform that connects developers based on their skills, interests, and project collaborations. It provides a space for developers to showcase their expertise, join projects, and build meaningful professional connections.

## Features

- 🔐 Authentication with Email and Google
- 👤 Customizable Developer Profiles
- 🎨 Dynamic Avatar Generation
- 🏷️ Skill and Category Management
- 👥 Project Collaboration
- 🤝 Team Management
- 📊 Admin Dashboard
- 📱 Responsive Design

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **UI Components**: shadcn/ui
- **Icons**: Lucide Icons
- **Avatar Generation**: DiceBear

## Getting Started

1. Clone the repository:

```
git clone https://github.com/adelelawady/stacktogether.git
cd stacktogether
```

2. Install dependencies:

```
npm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```


4. Start the development server:


```
npm run dev
```

## Project Structure

```

src/
├── components/ # Reusable UI components
├── contexts/ # React contexts
├── hooks/ # Custom React hooks
├── lib/ # Utility functions
├── pages/ # Page components
├── types/ # TypeScript type definitions
└── styles/ # Global styles

```


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Adel Elawady - [GitHub](https://github.com/adelelawady)

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [DiceBear](https://www.dicebear.com/) for the avatar generation