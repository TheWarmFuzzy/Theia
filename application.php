<!DOCTYPE html>
<html>
<head>
	<style>
		body{
			margin:10px;
			overflow:hidden;
			background-color: #000;
		}
		video, canvas{
			position:absolute;
			top:50%;
			margin-top:-225px;
			left:50%;
			margin-left:-300px;
		}
		/*video, canvas{
			position:absolute;
			top:0px;
			left:0px;
		}*/
		canvas{
			z-index:100;
		}
		#back{
			font-family: Helvetica, Arial, Sans-Serif;
			text-decoration: none;
			color:#fff
		}
		#back:visited{
			color:#fff
		}
	</style>
	<meta http-equiv="Cache-Control" content="no-store" />
	<meta name="mobile-web-app-capable" content="yes">
</head>
<body>
	<a id="back" href="index.php">Back to Homepage</a>
	<script type="text/javascript" src="lib/jquery-1.11.3.js"></script>
	<script type="text/javascript" src="lib/Ajax.js"></script>
	
	<script type="text/javascript" src="lib/llqrcode.js"></script>    
    <script type="text/javascript" src="lib/qrcode.js"></script>
	
	<script type="text/javascript" src="lib/theia_lib.js"></script>
	<script type="text/javascript" src="lib/camera.js"></script>
	
	<script type="text/javascript" src="lib/three.js"></script>
	<script type="text/javascript" src="lib/Animation.js"></script>
	<script type="text/javascript" src="lib/AnimationHandler.js"></script>
	<script type="text/javascript" src="lib/KeyFrameAnimation.js"></script>
	<script type="text/javascript" src="lib/ColladaLoader.js"></script>
	<script type="text/javascript" src="lib/OBJLoader.js"></script>
	<script type="text/javascript" src="lib/3DOverlay.js"></script>
	
	<script type="text/javascript" src="lib/tracking_mk_theia.js"></script>
	
	<script type="text/javascript" src="lib/QR_Code.js"></script>
	<script type="text/javascript" src="lib/Showcase.js"></script>
	<script type="text/javascript" src="lib/Sprite_Sheet.js"></script>
	<script type="text/javascript" src="lib/theia_tracker.js"></script>
	<script type="text/javascript" src="lib/Theia.js"></script>
	
	<script type="text/javascript">
		//var video_scalar = camera.width / 600 > camera.height / 450 ? camera.width / 600 : camera.height / 450;
		var video_scalar = .75;
		var theia = new Theia();
		theia.start();	
	</script>
	
</body>
</html>