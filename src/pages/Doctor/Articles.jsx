import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ExternalLink, Calendar, Users, ChevronRight, ChevronLeft, AlertCircle, BookOpen } from 'lucide-react';

const PubMedArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPubMedArticles = async () => {
    try {
      setLoading(true);
      setIsRefreshing(true);
      const searchTerm = 'pathological myopia';
      const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
      const summaryUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

      // Searching for article IDs
      const searchResponse = await fetch(`${baseUrl}?db=pubmed&term=${encodeURIComponent(searchTerm)}&retmax=100&retmode=json&sort=relevance`);
      const searchData = await searchResponse.json();
      const articleIds = searchData.esearchresult.idlist;

      // Fetching details for those articles
      const detailsResponse = await fetch(`${summaryUrl}?db=pubmed&id=${articleIds.join(',')}&retmode=json`);
      const detailsData = await detailsResponse.json();

      // Processing article details
      const articleDetails = articleIds.map(id => {
        const details = detailsData.result[id];
        return {
          id: id,
          title: details?.title || 'Untitled',
          authors: details?.authors?.map(author => author.name).join(', ') || 'Unknown Authors',
          pubDate: details?.pubdate || 'N/A', 
          journal: details?.fulljournalname || details?.source || 'Unknown Journal',
          source: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
        };
      });

      setArticles(articleDetails);
      setFilteredArticles(articleDetails);
      setLoading(false);
      setIsRefreshing(false);
    } catch (err) {
      console.error('PubMed fetch error:', err);
      setError('Failed to fetch articles. Please try again later.');
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPubMedArticles();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase().trim();
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(lowercasedQuery) || 
        article.authors.toLowerCase().includes(lowercasedQuery) ||
        (article.journal && article.journal.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredArticles(filtered);
    }
    setCurrentPage(1); // Reset to first page when search query changes
  }, [searchQuery, articles]);

  // Get current articles for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const handleRefresh = () => {
    fetchPubMedArticles();
  };

  // Render loading state
  if (loading && !isRefreshing) {
    return (
      <div className="flex flex-col justify-center items-center p-12 bg-white rounded-xl shadow-lg min-h-64">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-blue-100 border-r-blue-100 rounded-full animate-spin mb-6"></div>
        <div className="text-blue-800 text-xl font-medium">Loading medical articles...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-lg border border-red-100">
        <div className="flex items-center text-red-600 text-lg mb-4">
          <AlertCircle className="mr-3" size={24} />
          <span className="font-medium">{error}</span>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center shadow-md transition-all hover:shadow-lg"
        >
          <RefreshCw size={18} className="mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-blue-100">
        <div className="flex items-center mb-2">
          <BookOpen size={28} className="text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-black to-black bg-clip-text text-transparent">
            Latest Pathological Myopia Research
          </h2>
        </div>
        <p className="text-gray-600 pl-10">Explore the latest research on pathological myopia from PubMed</p>
      </div>
      
      {/* Refresh Notification */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center shadow-lg z-10 animate-pulse">
          <RefreshCw size={18} className="animate-spin mr-2" />
          Refreshing articles...
        </div>
      )}
      
      {/* Search and Controls */}
      <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
        <div className="relative flex-grow">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
            <Search size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
            placeholder="Search by title, author, or journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          onClick={handleRefresh}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-md transition-all hover:shadow-lg font-medium"
          disabled={isRefreshing}
        >
          <RefreshCw size={18} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* No Results State */}
      {filteredArticles.length === 0 ? (
        <div className="py-12 px-8 bg-gray-50 rounded-xl text-gray-600 text-center border border-gray-200">
          <div className="flex flex-col items-center">
            <Search size={48} className="text-gray-400 mb-4" />
            <p className="text-xl font-medium mb-2">No articles found matching your search query.</p>
            <p className="text-gray-500">Try using different keywords or refreshing the results.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-6 text-sm text-gray-500 flex items-center">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {filteredArticles.length} results
            </div>
            <div className="ml-3">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredArticles.length)} of {filteredArticles.length} articles
            </div>
          </div>
          
          {/* Articles Grid */}
          <div className="space-y-6">
            {currentItems.map(article => (
              <div key={article.id} className="p-6 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 leading-snug">{article.title}</h3>
                
                <div className="flex flex-wrap gap-y-3 mb-4">
                  <div className="flex items-center text-gray-700 mr-6">
                    <Users size={16} className="mr-2 text-blue-500" />
                    <span className="text-sm">{article.authors}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700 mr-6">
                    <Calendar size={16} className="mr-2 text-blue-500" />
                    <span className="text-sm">{article.pubDate}</span>
                  </div>
                </div>
                
                {article.journal && article.journal !== 'Unknown Journal' && (
                  <div className="mb-4">
                    <span className="text-sm text-blue-700 bg-blue-50 px-3 py-1 rounded-full font-medium">
                      {article.journal}
                    </span>
                  </div>
                )}
                
                <a 
                  href={article.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-sm mt-2 transition-colors hover:bg-blue-50 px-4 py-2 rounded-lg"
                >
                  View on PubMed
                  <ExternalLink size={16} className="ml-2" />
                </a>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`mx-1 p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                aria-label="Previous page"
              >
                <ChevronLeft size={24} />
              </button>
              
              {/* Display limited page numbers with ellipsis for many pages */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`mx-1 w-10 h-10 flex items-center justify-center rounded-lg ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white font-medium shadow-md' 
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                    aria-label={`Page ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`mx-1 p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
                aria-label="Next page"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-gray-200 text-sm text-gray-500 text-center">
        <p>Data sourced from PubMed, a service of the National Library of Medicine</p>
      </div>
    </div>
  );
};

export default PubMedArticles;