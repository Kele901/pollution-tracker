# Pollution Tracker Application

A real-time air quality monitoring application built with Next.js that allows users to track pollution levels across different locations worldwide. The application provides interactive maps, historical data visualization, and location comparisons.

## Features

- **Live Map**: Real-time visualization of air quality data on an interactive map
- **Location Comparison**: Compare air quality metrics between different locations
- **Timeline View**: Historical air quality data with customizable time ranges
- **Global Coverage**: Monitor pollution levels in cities worldwide
- **Dark Mode Support**: Comfortable viewing experience in any lighting condition

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Maps**: Leaflet
- **State Management**: React Query
- **Type Safety**: TypeScript

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Kele901/pollution-tracker.git
cd pollution-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_KEY=your_api_key_here
```

## Project Structure

```
pollution-tracker/
├── src/
│   ├── app/             # App router pages
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── types/          # TypeScript types
├── public/             # Static assets
└── ...config files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Leaflet](https://leafletjs.com/)
