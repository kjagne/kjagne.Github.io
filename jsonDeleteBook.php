<?php
//delete the json record file from the server
$Title = $_GET['Title'];
unlink('./Book/'.$Title.'.json');
?>
