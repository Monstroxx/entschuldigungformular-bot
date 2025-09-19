"""Health Check für den Entschuldigungsformular Bot."""

import asyncio
from aiohttp import web
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class HealthCheck:
    """Health Check Server für Railway Deployment."""
    
    def __init__(self, bot_instance=None):
        """Initialisiert den Health Check."""
        self.bot = bot_instance
        self.app = web.Application()
        self.setup_routes()
    
    def setup_routes(self):
        """Richtet die Health Check Routes ein."""
        self.app.router.add_get('/health', self.health_check)
        self.app.router.add_get('/', self.root)
    
    async def health_check(self, request):
        """Health Check Endpoint."""
        try:
            status = {
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "bot_ready": self.bot is not None and self.bot.is_ready(),
                "uptime": self.bot.get_uptime() if self.bot else "unknown"
            }
            
            return web.json_response(status)
        except Exception as e:
            logger.error(f"Health check error: {e}")
            return web.json_response(
                {"status": "unhealthy", "error": str(e)},
                status=500
            )
    
    async def root(self, request):
        """Root Endpoint."""
        return web.json_response({
            "message": "Entschuldigungsformular Discord Bot",
            "status": "running",
            "timestamp": datetime.utcnow().isoformat()
        })
    
    async def start_server(self, port: int = 8000):
        """Startet den Health Check Server."""
        try:
            runner = web.AppRunner(self.app)
            await runner.setup()
            site = web.TCPSite(runner, '0.0.0.0', port)
            await site.start()
            logger.info(f"Health check server started on port {port}")
        except Exception as e:
            logger.error(f"Failed to start health check server: {e}")
    
    async def stop_server(self):
        """Stoppt den Health Check Server."""
        try:
            await self.app.cleanup()
            logger.info("Health check server stopped")
        except Exception as e:
            logger.error(f"Error stopping health check server: {e}")
