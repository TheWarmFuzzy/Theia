//var server_url = "http://localhost/remote_server/";
var request_page = "Test_Json.php";
var server_url = "https://theia.jtnelson.ca/";
//var request_page = "otj.php";

function theia_ajax_get(id, s, f){
	var url = server_url + request_page;
	$.ajax({
		url:url,
		data:{"id":id},
		error:f,
		success:s,
		dataType:"json",
		type:"GET"
	});
}

function theia_ajax_post(id, s, f){
	var url = server_url + request_page;
	$.ajax({
		url:url,
		data:{"id":id},
		error:f,
		success:s,
		dataType:"json",
		type:"POST"
	});
}
	
function onSuccess(data){
	console.log(data);
}
function onFailure(data, status, e){
	console.log("%c Error loading model info:", 'color: #c00', "\n", e);
}