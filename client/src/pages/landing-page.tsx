import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to FamilyPoints
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A multilingual family activity tracking app with role-based permissions, action management, and reporting features
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Family Management</h3>
            <p className="text-gray-600">Create and manage family members with different roles: head, parent, and child.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Action Tracking</h3>
            <p className="text-gray-600">Assign actions with points to children, track completion, and manage rewards.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-gray-600">Generate detailed reports on activity completion and point accumulation over time.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Action Suggestions</h3>
            <p className="text-gray-600">Children can suggest actions, which parents or family heads can approve or decline.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multilingual Support</h3>
            <p className="text-gray-600">Full support for English and Russian languages with easy language switching.</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full mb-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Role-Based Security</h3>
            <p className="text-gray-600">Different permissions based on family roles, ensuring appropriate access control.</p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <button className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition font-medium">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;