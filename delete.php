<?php
if ($_POST["key"] != "fetch") header('Location: index.html');

header("Content-type: application/json");
if (unlink($_POST["fileName"])) {
    echo json_encode([ "status" => true]);
}
else {
    echo json_encode([ "status" => false]);
}