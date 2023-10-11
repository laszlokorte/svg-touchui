<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>SVG Touch UI</title>
	<link rel="icon" href="favicon.svg">
	<link rel="stylesheet" href="main.css">
	<script src="main.js"></script>
</head>
<body>
	<div class="container">
		<svg onload="makeInteractive(this)" can-magnify can-pan use-bounds viewBox="-500 -500 1000 1000" width="800" height="500" preserveAspectRatio="xMidYMid meet">
			<g can-rotate use-bounds>
				<rect x="-500" y="-500" width="1000" height="1000" fill="#e7e7e7" stroke="black" vector-effect="non-scaling-stroke"></rect>
				<circle fill="#e1007a" r="50" cx="0" cy="0"></circle>
			</g>
			<g show-debug class="light-overlay"></g>
		</svg>
	</div>
</body>
</html>