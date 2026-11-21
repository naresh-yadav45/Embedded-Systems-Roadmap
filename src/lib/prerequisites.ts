import type { GraphNode } from '../types';
import { nodeByTitle } from './data';

/**
 * Suggested foundations, curated for this project. The original roadmap defines connections
 * but not strict prerequisites, so this list is intentionally small and easy to extend.
 */
const PREREQ: Record<string, string[]> = {
  'C++': ['C'], 'Memory Management': ['C'], 'Design Patterns': ['C++'], 'Qt Framework': ['C++'],
  GDB: ['C', 'Compilers / GCC'], OpenOCD: ['JTAG / SWD'], 'JTAG / SWD': ['GPIO'],
  'Make / CMake': ['Compilers / GCC'], 'CI/CD Pipelines': ['Git', 'Make / CMake'], 'TDD & Unit Testing': ['C'],
  'SIL / HIL Testing': ['TDD & Unit Testing'],
  GPIO: ['Digital Design', 'C'], Interrupts: ['GPIO', 'C'], 'Timers / Counters': ['GPIO'], PWM: ['Timers / Counters'],
  'ADC / DAC': ['GPIO'], DMA: ['Interrupts'], Watchdog: ['Timers / Counters'], 'Clock Management': ['GPIO'],
  'Power Management': ['Clock Management'], 'Bootloader / DFU': ['Memory Technologies & File Systems', 'C'],
  UART: ['GPIO'], I2C: ['GPIO'], SPI: ['GPIO'],
  'RTOS Basics': ['C', 'Interrupts'], FreeRTOS: ['RTOS Basics'], Zephyr: ['RTOS Basics'], QNX: ['RTOS Basics'],
  'µC/OS': ['RTOS Basics'], 'RT-Thread': ['RTOS Basics'],
  'Linux Kernel': ['Operating System Fundamentals', 'C'], 'Device Drivers': ['Linux Kernel'], 'U-Boot': ['Bootloader / DFU'],
  'Buildroot / Yocto': ['Linux Kernel', 'Make / CMake'], 'Threading / Parallelism': ['Operating System Fundamentals'], IPC: ['Operating System Fundamentals'],
  'Operating System Fundamentals': ['Computer Architecture', 'C'],
  MQTT: ['TCP/IP'], CoAP: ['UDP'], 'TCP/IP': ['Ethernet'], Bluetooth: ['SPI'], 'Wi-Fi': ['TCP/IP'],
  Matter: ['Wi-Fi', 'Thread'], Thread: ['Zigbee'], 'NB-IoT': ['GSM / LTE'], 'LTE-M / 5G': ['GSM / LTE'],
  CAN: ['UART'], LIN: ['UART'], FlexRay: ['CAN'], MOST: ['CAN'], Modbus: ['UART'], EtherCAT: ['Ethernet'], Profinet: ['Ethernet'],
  AUTOSAR: ['CAN', 'RTOS Basics'], 'Embedded Security': ['TCP/IP'], 'Edge AI': ['Python', 'Digital Signal Processing'],
  IoT: ['MQTT', 'Wi-Fi'], 'Embedded GUI': ['SPI'], 'Digital Signal Processing': ['Basic Math & Calculus'], 'Control Theory': ['Basic Math & Calculus'],
  'Electronics Fundamentals': ['Principles of Electric Circuits'], 'Digital Design': ['Electronics Fundamentals'],
  'Computer Architecture': ['Digital Design'], 'Principles of Electric Circuits': ['Basic Math & Calculus'],
  Oscilloscope: ['Multimeter'], 'Logic / Protocol Analyzer': ['Multimeter'], 'PCB Design / EMC': ['Hardware Design Basics', 'Electronics Fundamentals'],
  'Hardware Design Basics': ['Electronics Fundamentals'], 'FPGA Development': ['Digital Design'], 'Soldering / Rework': ['Breadboarding'],
  'MIPI CSI-2': ['I2C'], 'MIPI DSI': ['SPI'], Ethernet: ['SPI'], USB: ['UART'], PCIe: ['USB'],
  Assembly: ['Computer Architecture'], 'State Machines': ['C'], 'Hardware Simulation / Emulation': ['C'],
};

export function prerequisitesFor(nodeId: string): GraphNode[] {
  const entry = [...nodeByTitle.values()].find((n) => n.id === nodeId);
  if (!entry) return [];
  return (PREREQ[entry.title] ?? []).map((t) => nodeByTitle.get(t)).filter((n): n is GraphNode => !!n);
}
