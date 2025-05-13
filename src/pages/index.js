import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Converter from '../components/Converter';
import Footer from '../components/Footer';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>MP4 to MP3 Converter - Free Online Tool</title>
        <meta name="description" content="Convert any video file to high quality MP3 for free" />
        <meta name="keywords" content="mp4 to mp3, video to audio converter, free online converter" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <LanguageSwitcher />
        
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          MP4 to MP3 Converter
        </h1>
        <p className="text-center mb-8 text-gray-600">
          Free tool to convert video files to high quality audio
        </p>
        
        <Converter />
        
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">How to use:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click 'Select file' to choose video (MP4)</li>
            <li>Press 'Convert' button</li>
            <li>Wait for conversion to complete</li>
            <li>Click 'Download' to save MP3 file</li>
          </ol>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
