<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Exception;

class TalentaService
{
    protected $clientId;     // username HMAC / client id
    protected $clientSecret; // secret key HMAC
    protected $baseUrl;

    public function __construct()
    {
        $this->clientId     = env('TALENTA_CLIENT_ID');     // misalnya HMAC username
        $this->clientSecret = env('TALENTA_CLIENT_SECRET'); // HMAC secret
        $this->baseUrl      = rtrim(env('TALENTA_BASE_URL', 'https://api.mekari.com'), '/');
    }

    /**
     * Generate headers for HMAC authentication.
     *
     * @param string $method   HTTP method, e.g. GET, POST
     * @param string $endpointPath Path + query, misalnya "/v2/talenta/v2/employee?limit=20"
     * @return array Headers to send
     */
    protected function generateHeaders(string $method, string $endpointPath): array
    {
        // 1. Generate date string dalam format UTC
        $date = gmdate('D, d M Y H:i:s') . ' GMT';

        // 2. Request-line → "METHOD path HTTP/1.1"
        // Misalnya: GET /v2/talenta/v2/employee?limit=20 HTTP/1.1
        // Pastikan $endpointPath mengandung path + query (tanpa domain)
        $requestLine = strtoupper($method) . ' ' . $endpointPath . ' HTTP/1.1';

        // 3. Gabungkan string to sign sesuai Talenta Postman pre-req:
        //    "date: {date}\n{requestLine}"
        $stringToSign = "date: {$date}\n{$requestLine}";

        // 4. Hitung signature HMAC SHA256, lalu encode ke Base64
        $signature = base64_encode(
            hash_hmac('sha256', $stringToSign, $this->clientSecret, true)
        );

        // 5. Bentuk header Authorization sesuai format:
        //    hmac username="xxx", algorithm="hmac-sha256", headers="date request-line", signature="yyy"
        $hmacHeader = sprintf(
            'hmac username="%s", algorithm="hmac-sha256", headers="date request-line", signature="%s"',
            $this->clientId,
            $signature
        );

        return [
            'Authorization' => $hmacHeader,
            'Date'          => $date,
            'Accept'        => 'application/json',
        ];
    }

    /**
     * GET request to Talenta
     *
     * @param string $path Endpoint path with query, mulai dari slash, misalnya "/v2/talenta/v2/employee?limit=20"
     * @return mixed Response JSON, atau throw error
     */
    public function get(string $path)
    {
        $method       = 'GET';
        $endpointPath = $path; // harus path+query
        $headers      = $this->generateHeaders($method, $endpointPath);

        $url = $this->baseUrl . $endpointPath;

        $response = Http::withHeaders($headers)
                        ->get($url);

        if ($response->failed()) {
            // opsi: throw exception atau log
            throw new Exception("Talenta API GET failed: " . $response->status() . " " . $response->body());
        }

        return $response->json();
    }
}
