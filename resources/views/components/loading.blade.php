<style>
    .dot {
        animation: bounce 1.2s infinite ease-in-out;
    }

    .dot:nth-child(2) {
        animation-delay: 0.2s;
    }

    .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes bounce {
        0%, 80%, 100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1);
        }
    }
</style>

<div {{ $attributes->merge(['class' => 'col-span-12 mt-20']) }}>
    <div class=" dark:text-white text-center">
        <div class="mb-4">
            <svg class="mx-auto animate-spin h-12 w-12 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                </circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
        </div>
        <h1 class="text-xl font-semibold mb-2">Please wait...</h1>
        <div class="flex justify-center gap-2 mt-4">
            <div class="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full dot"></div>
            <div class="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full dot"></div>
            <div class="w-3 h-3 bg-indigo-500 dark:bg-indigo-400 rounded-full dot"></div>
        </div>
    </div>
</div>
