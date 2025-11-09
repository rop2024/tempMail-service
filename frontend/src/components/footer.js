export class Footer {
    render() {
        return `
            <footer class="bg-white border-t mt-20">
                <div class="container mx-auto px-4 py-8">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <!-- Brand -->
                        <div class="md:col-span-1">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="bg-blue-600 text-white p-2 rounded-lg">
                                    <i class="fas fa-envelope text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-bold text-gray-800">TempMail</h3>
                                    <p class="text-sm text-gray-600">Secure & Anonymous</p>
                                </div>
                            </div>
                            <p class="text-sm text-gray-600 mb-4">
                                Free temporary email service to protect your privacy and avoid spam.
                            </p>
                            <div class="flex space-x-3">
                                <a href="#" class="text-gray-400 hover:text-gray-600 transition duration-200">
                                    <i class="fab fa-github text-xl"></i>
                                </a>
                                <a href="#" class="text-gray-400 hover:text-gray-600 transition duration-200">
                                    <i class="fab fa-twitter text-xl"></i>
                                </a>
                                <a href="#" class="text-gray-400 hover:text-gray-600 transition duration-200">
                                    <i class="fab fa-discord text-xl"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Features -->
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-4">Features</h4>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li><i class="fas fa-check text-green-500 mr-2"></i>No Registration</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Complete Anonymity</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Mobile Friendly</li>
                                <li><i class="fas fa-check text-green-500 mr-2"></i>Auto Refresh</li>
                            </ul>
                        </div>

                        <!-- Quick Links -->
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-4">Quick Links</h4>
                            <ul class="space-y-2">
                                <li><a href="#" class="text-sm text-gray-600 hover:text-blue-600 transition duration-200">Create Email</a></li>
                                <li><a href="#" class="text-sm text-gray-600 hover:text-blue-600 transition duration-200">Inbox</a></li>
                                <li><a href="#" class="text-sm text-gray-600 hover:text-blue-600 transition duration-200">FAQ</a></li>
                                <li><a href="#" class="text-sm text-gray-600 hover:text-blue-600 transition duration-200">Privacy Policy</a></li>
                            </ul>
                        </div>

                        <!-- Support -->
                        <div>
                            <h4 class="font-semibold text-gray-800 mb-4">Support</h4>
                            <ul class="space-y-2 text-sm text-gray-600">
                                <li><i class="fas fa-envelope mr-2"></i>help@tempmail.com</li>
                                <li><i class="fas fa-globe mr-2"></i>Documentation</li>
                                <li><i class="fas fa-bug mr-2"></i>Report Issue</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Bottom Bar -->
                    <div class="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                        <div class="text-sm text-gray-600 mb-4 md:mb-0">
                            &copy; 2024 TempMail App. All rights reserved.
                        </div>
                        <div class="flex space-x-6 text-sm text-gray-600">
                            <a href="#" class="hover:text-blue-600 transition duration-200">Privacy</a>
                            <a href="#" class="hover:text-blue-600 transition duration-200">Terms</a>
                            <a href="#" class="hover:text-blue-600 transition duration-200">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}