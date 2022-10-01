<?php
if ($_POST["key"] != "fetch") header('Location: index.html');

$extension = explode("/", $_FILES["file"]["type"]);
$extension = $extension[1];
$fileName = "temp." . $extension;
$result = move_uploaded_file($_FILES["file"]["tmp_name"], $fileName);

if ($result !== false) {
    sendResult(true, $fileName);
}
else {
    sendResult(false, "error");
}

function sendResult($status, $data) {
    header("Content-type: application/json");
    echo json_encode([
        "status" => $status,
        "result" => $data
    ]);
}