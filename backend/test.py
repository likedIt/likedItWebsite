# importing required libraries 
import numpy as np 
import pickle
import sys
# import support vector classifier 
from sklearn.svm import SVC

def predict_image(imagefile):
	filename = 'finalized_model.sav'
	clf = pickle.load(open(filename, 'rb'))
	#out = loaded_model.predict([test_X[i]]) 
	prob = clf.predict_proba([imagefile]) 
	print( prob[0][0], ",",prob[0][1], ",",prob[0][2])
	#return prob[0]

if __name__ == "__main__":
	#au = []
	sys_input= sys.argv
	for i in range(1,len(sys_input),17):
		no = sys.argv[i:i+17]#[676:693]
		a = np.array(no) 
		au = a.astype(float)
		#au.append( no)
		
		predict_image(au)
		#print( out )
	

