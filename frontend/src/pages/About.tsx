import { MinimalNavbar } from 'components/MinimalNavbar';
import { TranslatedText } from 'components/TranslatedText';
import { LanguageProvider } from 'utils/languageContext';

function About() {
  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-light mb-8">
          <TranslatedText text="About Us" />
        </h1>

        <div className="prose prose-lg max-w-none">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>

          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AboutContent() {
  return (
    <LanguageProvider>
      <About />
    </LanguageProvider>
  );
}