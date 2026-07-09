<?php
session_start();

define('CONTACT_TO', 'info@perchibrest.by');
define('CONTACT_FROM', 'noreply@perchibrest.by');
define('RATE_LIMIT', 5);
define('RATE_WINDOW', 3600);

function contact_redirect($status, $reason = '')
{
    $params = array('contact' => $status);
    if ($reason !== '') {
        $params['reason'] = $reason;
    }
    header('Location: index.html?' . http_build_query($params) . '#contact');
    exit;
}

function contact_has_header_injection($value)
{
    return (bool) preg_match('/[\r\n]/', $value);
}

function contact_is_valid_phone($value)
{
    $digits = preg_replace('/\D/', '', $value);
    return strlen($digits) >= 5 && strlen($digits) <= 15
        && preg_match('/^[\d\s+\-()]+$/u', $value);
}

function contact_str_len($value)
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

function contact_is_valid_csrf($token)
{
    return is_string($token)
        && $token !== ''
        && isset($_SESSION['csrf_token'])
        && is_string($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $token);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    contact_redirect('error', 'method');
}

// Honeypot: скрытое поле для ботов
if (!empty($_POST['website'])) {
    contact_redirect('sent');
}

$csrfToken = isset($_POST['csrf_token']) ? (string) $_POST['csrf_token'] : '';
if (!contact_is_valid_csrf($csrfToken)) {
    contact_redirect('error', 'validation');
}

$now = time();
if (!isset($_SESSION['contact_submissions']) || !is_array($_SESSION['contact_submissions'])) {
    $_SESSION['contact_submissions'] = array();
}

$recent = array();
foreach ($_SESSION['contact_submissions'] as $timestamp) {
    if ($timestamp > $now - RATE_WINDOW) {
        $recent[] = $timestamp;
    }
}
$_SESSION['contact_submissions'] = $recent;

if (count($_SESSION['contact_submissions']) >= RATE_LIMIT) {
    contact_redirect('error', 'rate');
}

$fio = trim((string) (isset($_POST['fio']) ? $_POST['fio'] : ''));
$contact = trim((string) (isset($_POST['email']) ? $_POST['email'] : ''));
$message = trim((string) (isset($_POST['message']) ? $_POST['message'] : ''));

$isValid = true;

if ($fio === '' || contact_str_len($fio) < 2 || contact_str_len($fio) > 100) {
    $isValid = false;
}

if ($contact === '' || contact_str_len($contact) > 200) {
    $isValid = false;
} elseif (!filter_var($contact, FILTER_VALIDATE_EMAIL) && !contact_is_valid_phone($contact)) {
    $isValid = false;
}

if ($message === '' || contact_str_len($message) < 10 || contact_str_len($message) > 5000) {
    $isValid = false;
}

if (contact_has_header_injection($fio) || contact_has_header_injection($contact) || contact_has_header_injection($message)) {
    $isValid = false;
}

if (!$isValid) {
    contact_redirect('error', 'validation');
}

$fioSafe = htmlspecialchars($fio, ENT_QUOTES, 'UTF-8');
$contactSafe = htmlspecialchars($contact, ENT_QUOTES, 'UTF-8');
$messageSafe = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

$subject = 'Письмо с сайта perchibrest.by';
$body = 'Пользователь: ' . $fioSafe . '<br />'
    . 'Контакт: ' . $contactSafe . '<br /><br />'
    . 'Сообщение:<br />' . $messageSafe;

$headers = array(
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: PerchiBrest <' . CONTACT_FROM . '>',
);

if (filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    $fioHeader = preg_replace('/[\r\n]/', '', $fio);
    $headers[] = 'Reply-To: ' . $fioHeader . ' <' . $contact . '>';
}

$headerString = implode("\r\n", $headers) . "\r\n";
$sent = mail(CONTACT_TO, $subject, $body, $headerString);

if ($sent) {
    $_SESSION['contact_submissions'][] = $now;
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    contact_redirect('sent');
}

contact_redirect('error', 'send');
