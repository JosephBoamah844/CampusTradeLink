import { useState } from 'react';
import Head from 'next/head';
import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';
import PostFeed from '@/components/Posts/PostFeed';
import ProductGrid from '@/components/Products/ProductGrid';
import SearchBar from '@/components/Search/SearchBar';
import { 
  SparklesIcon, 
  ShoppingBagIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

const tabs = [
  {
    name: 'Trending',
    icon: FireIcon,
    component: 'posts',
  },
  {
    name: 'Marketplace',
    icon: ShoppingBagIcon,
    component: 'products',
  },
];

export default function ExplorePage() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <Head>
        <title>Explore - Campus Trade Link</title>
        <meta name="description" content="Discover trending posts and products on campus" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Explore Campus
            </h1>
          </div>
          
          {/* Search Bar */}
          <SearchBar placeholder="Search posts, products, users..." />
        </div>

        {/* Tabs */}
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                    'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                    selected
                      ? 'bg-white text-primary-700 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                  )
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* Trending Posts */}
            <Tab.Panel className="focus:outline-none">
              <div className="max-w-2xl mx-auto">
                <PostFeed type="explore" />
              </div>
            </Tab.Panel>

            {/* Marketplace */}
            <Tab.Panel className="focus:outline-none">
              <ProductGrid />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
}