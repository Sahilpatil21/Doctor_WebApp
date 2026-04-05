import React from 'react';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const QueueStatus = ({ queue, currentQueueNumber = null }) => {
  const getQueuePosition = () => {
    if (!currentQueueNumber) return null;
    return queue.findIndex(apt => apt.queueNumber === currentQueueNumber) + 1;
  };

  const queuePosition = getQueuePosition();
  const estimatedWaitTime = queuePosition ? (queuePosition - 1) * 15 : 0; // 15 mins per patient

  return (
    <div className="space-y-6">
      {/* Queue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total in Queue</p>
              <p className="text-2xl font-bold text-blue-900">{queue.length}</p>
            </div>
          </div>
        </div>

        {queuePosition && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Your Position</p>
                <p className="text-2xl font-bold text-green-900">#{queuePosition}</p>
              </div>
            </div>
          </div>
        )}

        {queuePosition && queuePosition > 1 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Est. Wait Time</p>
                <p className="text-2xl font-bold text-yellow-900">{estimatedWaitTime}m</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Current Queue</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {queue.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No patients in queue</p>
            </div>
          ) : (
            queue.map((appointment, index) => {
              const isCurrentPatient = appointment.queueNumber === currentQueueNumber;
              return (
                <div
                  key={appointment._id}
                  className={`p-4 flex items-center space-x-4 transition-colors ${
                    isCurrentPatient ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Queue Number */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isCurrentPatient
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {appointment.queueNumber}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {appointment.patient?.name}
                      </p>
                      {isCurrentPatient && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{appointment.timeSlot}</span>
                      <span>{appointment.patient?.phone}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      appointment.status === 'Confirmed' 
                        ? 'bg-blue-500' 
                        : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-sm text-gray-600">{appointment.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Instructions */}
      {queuePosition && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Queue Instructions</h4>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                {queuePosition === 1 && (
                  <li>• You're next! Please be ready for your consultation.</li>
                )}
                {queuePosition > 1 && (
                  <li>• There are {queuePosition - 1} patient(s) ahead of you.</li>
                )}
                <li>• Please arrive 10 minutes before your scheduled time.</li>
                <li>• Keep your phone available for any updates.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueStatus;
