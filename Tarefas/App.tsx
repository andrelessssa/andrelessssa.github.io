import React, { useState, useEffect, useRef } from 'react';
import { TaskList } from './components/TaskList';
import { Reports } from './components/Reports';
import { Task } from './types';
import { 
  getTasks, 
  addTask, 
  updateTask, 
  deleteTask, 
  importTasksData,
  processRecurringTasks
} from './services/storage';
import { 
  initGoogleDrive, 
  handleAuthClick, 
  uploadToDrive, 
  downloadFromDrive, 
  getStoredDriveConfig, 
  saveDriveConfig,
  handleSignOut,
  DriveConfig 
} from './services/drive';

function App() {
  const [currentView, setCurrentView] = useState<'tasks' | 'reports'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drive State
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveConfig, setDriveConfig] = useState<DriveConfig | null>(null);

  // Load tasks and process recurring logic
  useEffect(() => {
    // First, check if any recurring tasks need to be reset for the new day
    const updatedTasks = processRecurringTasks();
    setTasks(updatedTasks);
    
    // Check Drive Config
    const config = getStoredDriveConfig();
    if (config) {
        setDriveConfig(config);
    }
  }, []);

  // Initialize Drive API when config is available
  useEffect(() => {
    if (driveConfig && !driveConnected) {
        // Allow some time for scripts to load
        setTimeout(() => {
            initGoogleDrive(driveConfig)
                .then(() => {
                    console.log("Drive API Initialized");
                })
                .catch(err => console.error("Drive Init Error", err));
        }, 1000);
    }
  }, [driveConfig]);

  const handleConnectDrive = async () => {
    if (!driveConfig) {
        // Prompt user for keys if not set
        const clientId = window.prompt("Por favor, insira seu Google Client ID:");
        if (!clientId) return;
        const apiKey = window.prompt("Por favor, insira sua Google API Key:");
        if (!apiKey) return;
        
        const newConfig = { clientId, apiKey };
        saveDriveConfig(newConfig);
        setDriveConfig(newConfig);
        // Effect will trigger init
        return;
    }

    try {
        setDriveLoading(true);
        await handleAuthClick();
        setDriveConnected(true);
        setDriveLoading(false);
    } catch (err) {
        console.error(err);
        alert("Erro ao conectar com Google. Verifique suas credenciais.");
        setDriveLoading(false);
    }
  };

  const handleDriveUpload = async () => {
    if (!driveConnected) return;
    try {
        setDriveLoading(true);
        await uploadToDrive(tasks);
        alert("Backup salvo no Google Drive com sucesso!");
    } catch (err) {
        alert("Erro ao salvar no Drive.");
    } finally {
        setDriveLoading(false);
    }
  };

  const handleDriveDownload = async () => {
    if (!driveConnected) return;
    try {
        setDriveLoading(true);
        const remoteTasks = await downloadFromDrive();
        if (remoteTasks) {
            // Save to local storage first
            importTasksData(JSON.stringify(remoteTasks));
            
            // IMMEDIATELY process recurring tasks (e.g., if backup was from yesterday)
            const processedTasks = processRecurringTasks();
            setTasks(processedTasks);
            
            alert("Tarefas restauradas e atualizadas para hoje!");
        } else {
            alert("Nenhum arquivo de backup encontrado no Drive.");
        }
    } catch (err) {
        alert("Erro ao baixar do Drive.");
    } finally {
        setDriveLoading(false);
    }
  };

  const handleDisconnectDrive = () => {
      handleSignOut();
      setDriveConnected(false);
  };

  const handleAddTask = (task: Task) => {
    const updated = addTask(task);
    setTasks(updated);
  };

  const handleUpdateTask = (task: Task) => {
    const updated = updateTask(task);
    setTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = deleteTask(id);
    setTasks(updated);
  };

  // Export tasks to a JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `andre_lessa_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger file input click
  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection and import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const importedTasks = importTasksData(content);
        if (importedTasks) {
          // IMMEDIATELY process recurring tasks after file import too
          const processedTasks = processRecurringTasks();
          setTasks(processedTasks);
          alert('Dados restaurados e atualizados com sucesso!');
        } else {
          alert('Erro ao importar arquivo. Verifique se o formato está correto.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 relative">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6">
            <div className="flex items-center gap-3 text-brand-600 font-bold text-xl">
                <i className="fas fa-layer-group"></i>
                <span>André Lessa</span>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
            <button 
                onClick={() => setCurrentView('tasks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'tasks' 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                <i className="fas fa-check-circle w-5"></i> Tarefas
            </button>
            <button 
                onClick={() => setCurrentView('reports')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'reports' 
                    ? 'bg-brand-50 text-brand-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
                <i className="fas fa-chart-pie w-5"></i> Relatórios
            </button>
        </nav>

        {/* Google Drive Section */}
        <div className="p-4 border-t border-slate-100">
             <h4 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <i className="fab fa-google-drive"></i> Nuvem
             </h4>
             {!driveConnected ? (
                 <button 
                    onClick={handleConnectDrive}
                    disabled={driveLoading}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                 >
                    {driveLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plug"></i>}
                    Conectar Drive
                 </button>
             ) : (
                 <div className="space-y-1">
                     <button 
                        onClick={handleDriveUpload}
                        disabled={driveLoading}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                     >
                        <i className="fas fa-cloud-upload-alt w-4"></i> Salvar na Nuvem
                     </button>
                     <button 
                        onClick={handleDriveDownload}
                        disabled={driveLoading}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                     >
                        <i className="fas fa-cloud-download-alt w-4"></i> Restaurar
                     </button>
                     <button 
                        onClick={handleDisconnectDrive}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                     >
                        <i className="fas fa-sign-out-alt w-4"></i> Desconectar
                     </button>
                 </div>
             )}
        </div>

        {/* Local Data Management Section */}
        <div className="p-4 border-t border-slate-100">
            <h4 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Local</h4>
            <div className="space-y-1">
                <button 
                    onClick={handleExport}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    title="Baixar backup das tarefas"
                >
                    <i className="fas fa-download w-4"></i> Backup (Arquivo)
                </button>
                <button 
                    onClick={triggerImport}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    title="Restaurar backup"
                >
                    <i className="fas fa-upload w-4"></i> Restaurar
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImport}
                    className="hidden"
                    accept=".json"
                />
            </div>
        </div>
      </aside>

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around p-3">
         <button 
            onClick={() => setCurrentView('tasks')}
            className={`flex flex-col items-center ${currentView === 'tasks' ? 'text-brand-600' : 'text-slate-400'}`}
         >
             <i className="fas fa-check-circle text-xl mb-1"></i>
             <span className="text-[10px] font-medium">Tarefas</span>
         </button>
         <button 
            onClick={() => setCurrentView('reports')}
            className={`flex flex-col items-center ${currentView === 'reports' ? 'text-brand-600' : 'text-slate-400'}`}
         >
             <i className="fas fa-chart-pie text-xl mb-1"></i>
             <span className="text-[10px] font-medium">Relatórios</span>
         </button>
         <button 
            onClick={driveConnected ? handleDriveUpload : handleConnectDrive}
            className="flex flex-col items-center text-slate-400 active:text-brand-600"
         >
             <i className={`fas ${driveConnected ? 'fa-cloud-upload-alt' : 'fa-plug'} text-xl mb-1`}></i>
             <span className="text-[10px] font-medium">{driveConnected ? 'Salvar Nuvem' : 'Conectar'}</span>
         </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8 pb-20 md:pb-8 pt-16 md:pt-8">
        {currentView === 'tasks' ? (
            <TaskList 
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
            />
        ) : (
            <Reports tasks={tasks} />
        )}
      </main>
    </div>
  );
}

export default App;