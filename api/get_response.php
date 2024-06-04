<?php

include 'config.php';

$sql = "SELECT question, answer FROM responses";
$result = $conn->query($sql);

$responses = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $responses[$row['question']] = $row['answer'];
    }
} else {
    echo "0 results";
}

$conn->close();

echo json_encode($responses);
