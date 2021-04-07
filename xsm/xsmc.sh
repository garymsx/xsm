export CURRENT=`dirname $0`
# export PATH=<javapath>:$PATH
java -jar "${CURRENT}/xsm.jar" -library ${CURRENT}/ $*
