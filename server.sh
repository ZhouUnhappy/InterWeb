#!/bin/bash

# 进度跟踪系统管理脚本

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 默认数据文件
DATA_FILE="interv.json"

# 停止服务函数
stop_services() {
	# 尝试通过端口找到进程并杀掉
	BACKEND_PID=$(lsof -ti:40001 2>/dev/null)
	if [ ! -z "$BACKEND_PID" ]; then
		echo "🔧 停止后端服务 (PID: $BACKEND_PID)..."
		kill $BACKEND_PID
		echo "   ✅ 后端已停止"
	fi

	# 尝试通过端口找到进程并杀掉
	FRONTEND_PID=$(lsof -ti:40000 2>/dev/null)
	if [ ! -z "$FRONTEND_PID" ]; then
		echo "🎨 停止前端服务 (PID: $FRONTEND_PID)..."
		kill $FRONTEND_PID
		echo "   ✅ 前端已停止"
	fi
}

# 启动服务函数
start_services() {
	cd "$SCRIPT_DIR/backend" && npm install
	cd "$SCRIPT_DIR/frontend" && npm install

	# 启动后端
	echo "🔧 启动后端服务 (端口: 40001)..."
	echo "📂 使用数据文件: backend/data/$DATA_FILE"
	cd "$SCRIPT_DIR/backend"
	DATA_FILE=$DATA_FILE npm start >/tmp/interv-backend.log 2>&1 &
	BACKEND_PID=$!
	echo "   后端进程 PID: $BACKEND_PID"

	# 启动前端
	echo "🎨 启动前端服务 (端口: 40000)..."
	cd "$SCRIPT_DIR/frontend"
	npm run dev >/tmp/interv-frontend.log 2>&1 &
	FRONTEND_PID=$!
	echo "   前端进程 PID: $FRONTEND_PID"

	echo ""
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo "✨ 服务启动成功！"
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo ""
	echo "📍 后端服务: http://localhost:40001"
	echo "📍 前端应用: http://localhost:40000"
	echo ""
	echo "📂 数据文件: backend/data/$DATA_FILE"
	echo "📝 后端日志: /tmp/int-backend.log"
	echo "📝 前端日志: /tmp/int-frontend.log"
	echo ""
	echo "🛑 停止服务: ./server.sh stop"
	echo "🔄 重启服务: ./server.sh restart [数据文件名]"
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo ""
}

# 显示帮助信息
show_help() {
	echo "进度跟踪系统 - 管理脚本"
	echo ""
	echo "用法: ./server.sh [命令] [数据文件名]"
	echo ""
	echo "命令:"
	echo "  stop      停止服务"
	echo "  restart   重启服务"
	echo "  help      显示帮助信息"
	echo ""
	echo "参数:"
	echo "  数据文件名  指定使用的数据文件（默认: interv.json）"
	echo ""
	echo "示例:"
	echo "  ./server.sh restart              # 使用默认数据文件 interv.json"
	echo "  ./server.sh restart demo.json    # 使用 backend/data/demo.json"
	echo "  ./server.sh stop                 # 停止服务"
	echo ""
}

# 主逻辑
case "${1}" in
stop)
	stop_services
	;;
restart)
	# 如果提供了第二个参数，使用它作为数据文件名
	if [ ! -z "$2" ]; then
		DATA_FILE="$2"
	fi
	stop_services
	sleep 1
	start_services
	;;
help | --help | -h)
	show_help
	;;
*)
	echo "❌ 未知命令: $1"
	echo ""
	show_help
	exit 1
	;;
esac
