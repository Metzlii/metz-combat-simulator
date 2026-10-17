@echo off
rem Runs the simulator locally: the page opens in your browser, the simulations run in Node on every core.
cd /d "%~dp0.."
node local\server.mjs %*
