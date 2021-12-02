<template>
      <div class="bg-white w-full h-auto px-3 py-2 flex flex-col space-y-2">
        <div class="flex items-center space-x-2">

          <div class="flex items-center justify-center space-x-2">
            <div class="block">


              <!-- Subcomment Sample -->
              <div class="flex items-center space-x-2 space-y-2">
                <div class="group relative flex flex-shrink-0 self-start cursor-pointer pt-2">
                  <img
                      x-on:mouseover="open2 = true" x-on:mouseleave="open2 = false"
                      src="https://images.unsplash.com/photo-1610156830615-2eb9732de349?ixid=MXwxMjA3fDB8MHx0b3BpYy1mZWVkfDExfHJuU0tESHd3WVVrfHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="" class="h-8 w-8 object-fill rounded-full">
                  <div x-cloak x-show.transition.origin.bottom="open2" x-on:mouseover="open2 = true" x-on:mouseleave="open2 = false" class="hidden absolute mt-8 bg-white px-4 py-4 w-72 shadow rounded cursor-default z-10">
                    <div class="flex space-x-3">
                      <div class="flex flex-shrink-0">
                        <img src="https://images.unsplash.com/photo-1610156830615-2eb9732de349?ixid=MXwxMjA3fDB8MHx0b3BpYy1mZWVkfDExfHJuU0tESHd3WVVrfHxlbnwwfHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" alt="" class="h-16 w-16 object-fill rounded-full">
                      </div>
                      <div class="flex flex-col space-y-2">
                        <div class="font-semibold">
                          <a href="#" class="hover:underline">
                            Hasan Muhammad
                          </a>
                        </div>
                        <div class="flex justify-start items-center space-x-2">
                          <div>
                            <svg class="w-4 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                          </div>
                          <div class="w-auto text-sm leading-none">
                            <small>
                              347 mutual friends including: <a href="#" class="font-semibold hover:underline">Ujang</a> and <a href="#" class="font-semibold hover:underline">Maman</a>
                            </small>
                          </div>
                        </div>
                        <div class="flex justify-start items-center space-x-2">
                          <div>
                            <svg class="w-4 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
                          </div>
                          <div class="w-auto text-sm leading-none">
                            <small>
                              Went to SMK Assalaam Bandung
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="flex space-x-1 mt-2">
                      <div class="w-1/2">
                        <a href="#" class="text-xs text-blue-600 hover:bg-opacity-60 font-semibold flex items-center justify-center px-3 py-2 bg-blue-300 bg-opacity-50 rounded-lg">
                          <div class="mr-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path></svg>
                          </div>
                          Tambah
                        </a>
                      </div>
                      <div class="w-auto">
                        <a href="#" class="text-xs text-gray-800 hover:bg-gray-300 font-semibold flex items-center justify-center px-3 py-2 bg-gray-200 rounded-lg">
                          <div class="mr-1">
                            <svg viewBox="0 0 28 28" alt="" class="h-4 w-4" height="20" width="20"><path d="M14 2.042c6.76 0 12 4.952 12 11.64S20.76 25.322 14 25.322a13.091 13.091 0 0 1-3.474-.461.956 .956 0 0 0-.641.047L7.5 25.959a.961.961 0 0 1-1.348-.849l-.065-2.134a.957.957 0 0 0-.322-.684A11.389 11.389 0 0 1 2 13.682C2 6.994 7.24 2.042 14 2.042ZM6.794 17.086a.57.57 0 0 0 .827.758l3.786-2.874a.722.722 0 0 1 .868 0l2.8 2.1a1.8 1.8 0 0 0 2.6-.481l3.525-5.592a.57.57 0 0 0-.827-.758l-3.786 2.874a.722.722 0 0 1-.868 0l-2.8-2.1a1.8 1.8 0 0 0-2.6.481Z"></path></svg>
                          </div>
                        </a>
                      </div>
                      <div class="w-auto">
                        <a href="#" class="text-xs text-gray-800 hover:bg-gray-300 font-semibold flex items-center justify-center px-3 py-2 bg-gray-200 rounded-lg">
                          <div class="mr-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path></svg>
                          </div>
                        </a>
                      </div>

                      <div class="w-auto">
                        <a href="#" class="text-xs text-gray-800 hover:bg-gray-300 font-semibold flex items-center justify-center px-3 py-2 bg-gray-200 rounded-lg">
                          <div class="mr-1">
                            <svg class="w-4 h-4 fill='currentColor'" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path></svg>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-center space-x-2">
                  <div class="block">
                    <div class="bg-gray-100 w-auto rounded-xl px-2 pb-2">
                      <div class="font-medium">
                        <a href="#" class="hover:underline text-sm">
                          <small>Hasan Muhammad</small>
                        </a>
                      </div>
                      <div class="text-xs">
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Expedita, maiores!
                      </div>
                    </div>
                    <div class="flex justify-start items-center text-xs w-full">
                      <div class="font-semibold text-gray-700 px-2 flex items-center justify-center space-x-1">
                        <a href="#" class="hover:underline">
                          <small>Like</small>
                        </a>
                        <small class="self-center">.</small>
                        <a href="#" class="hover:underline">
                          <small>Reply</small>
                        </a>
                        <small class="self-center">.</small>
                        <a href="#" class="hover:underline">
                          <small>15 hour</small>
                        </a>
                      </div>
                    </div>
                  </div>

                </div>

                <div class="self-stretch flex justify-center items-center transform transition-opacity duration-200 opacity-0 translate -translate-y-2 hover:opacity-100">
                  <a href="#" class="">
                    <div class="text-xs cursor-pointer flex h-6 w-6 transform transition-colors duration-200 hover:bg-gray-100 rounded-full items-center justify-center">
                      <svg class="w-4 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                    </div>

                  </a>
                </div>

              </div>

              <!-- New Subcomment Paste Here !! -->

            </div>
          </div>

        </div>



        <PostComment :key="idx" v-for="(comment, idx) in comments" :comment="comment" />
        <!-- New Comment Paste Here -->

      </div>
</template>

<script setup lang="ts">
import PostComment from '@/components/Dashboard/PostComment.vue'

const props = defineProps<{comments: object}>()
</script>

<style scoped>

</style>