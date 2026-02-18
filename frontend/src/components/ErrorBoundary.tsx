import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { NeonButton } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neon-dark flex items-center justify-center p-4">
          <div className="bg-black/40 border border-neon-pink p-8 rounded-lg max-w-md w-full backdrop-blur-md text-center">
            <AlertTriangle className="w-16 h-16 text-neon-pink mx-auto mb-4" />
            <h1 className="text-2xl font-cyber text-white mb-2">SYSTEM FAILURE</h1>
            <p className="text-gray-400 font-mono mb-6">
              Critical error detected in interface rendering module.
            </p>
            <div className="bg-black/50 p-4 rounded mb-6 text-left overflow-auto max-h-40">
              <code className="text-neon-pink text-xs font-mono">
                {this.state.error?.message}
              </code>
            </div>
            <NeonButton variant="pink" onClick={this.handleRetry} className="w-full">
              SYSTEM REBOOT
            </NeonButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
