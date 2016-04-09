<?php
 defined("DNS_TYPE") or define("DNS_TYPE","mysql");
 defined("DB_HOST") or define("DB_HOST","localhost");
 defined("DB_NAME") or define("DB_NAME","theia");
 defined("DB_USERNAME") or define("DB_USERNAME","root");
 defined("DB_PASSWORD") or define("DB_PASSWORD","DerpMobile1");
 defined("DB_PORT") or define("DB_PORT",null);
 require_once "PDOConnection.php";
 
if(!isset($_GET["id"]))
{
	echo 'error';
	exit();
}
if(empty($_GET["id"]))
{
	echo 'error1';
	exit();
}

$connection = new PDOConnection(DNS_TYPE, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME);
$sql = 'SELECT * FROM modelstorage WHERE id = ?';
$sql2 = 'SELECT * FROM modeloffset WHERE id = ?';

$arg = array($_GET["id"]);
$result = $connection->query($sql, $arg);
$result2 = $connection->query($sql2, $arg2);
	$connection->close();
	
	$result = $result[0];
	$result2 = $result2[0];
	if(is_array($result2)){
		$result2["position"]["x"] = $result2["positionX"];
		$result2["position"]["y"] = $result2["positionY"];
		$result2["position"]["z"] = $result2["positionZ"];
		$result["offsets"]=$result2;
	}
	
	
	
	

 //$plzwork = json_encode ( $result2, true );
 $youcandoit = json_encode ( $result, true );
 //echo $plzwork;
 echo $youcandoit;
?>