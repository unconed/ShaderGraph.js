#!/bin/bash
VENDOR="
vendor/underscore.js
"

SRC="
src/Common.js
src/Block.js
src/Factory.js
src/Program.js
src/Snippet.js
src/Graph/Graph.js
src/Graph/Node.js
src/Graph/Outlet.js
"

cat $VENDOR $SRC > build/ShaderGraph.js
cat $SRC > build/ShaderGraph-core.js

if [ -z "$SKIP_MINIFY" ]; then
curl --data-urlencode "js_code@build/ShaderGraph.js" 	\
	-d "output_format=text&output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS&language=ECMASCRIPT5" \
	http://closure-compiler.appspot.com/compile	\
	> build/ShaderGraph.min.js

curl --data-urlencode "js_code@build/ShaderGraph-core.js" 	\
	-d "output_format=text&output_info=compiled_code&compilation_level=SIMPLE_OPTIMIZATIONS&language=ECMASCRIPT5" \
	http://closure-compiler.appspot.com/compile	\
	> build/ShaderGraph-core.min.js
fi