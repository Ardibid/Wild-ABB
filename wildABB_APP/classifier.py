import cv2
import urllib.request
import os
import tensorflow as tf
import random
import time
import copy

########################################
# Global Variable
########################################
# rate treshhold
rateThreshold = 0.1

# inception model graphs
retrainedLabels = "./static/classifier/retrained_labels.txt"
retrainedGraph = "./static/classifier/retrained_graph.pb"

logResult = ""
imagePath = "./static/sensors/capture.jpg"
sensorPath = "./static/sensors/"

def classifier():
    # a wrapper for the image reading and processing
    readImage()
    names = process()
    return names

def process(graph= None):
    # a wrapper for classifier and returning results
    if (not graph):
        graph = imageClassifier()
    names = findProblems(graph)
    return (names)

def findProblems(myGraph):
    # devide the original image based on the graph data
    r, leaves = bfsOrder(myGraph)
    sourceImage = cv2.imread(imagePath)
    names = []
    h_, w_, __ = sourceImage.shape

    # finds the coordination of every leaf on the original image
    for leaf in leaves:
        indexList = leaf.index.split("|")
        indexList = [int(s) for s in indexList]
        indexList.pop(0)
        depth = len(indexList)
        nameList = copy.deepcopy(indexList)
        nameList = [str(s) for s in nameList]
        image = cv2.imread(imagePath)
        h, w, _ = image.shape
        wOrigin = 0
        hOrigin = 0
        wJump = 0
        hJump = 0
        while (len(indexList) != 0):
            moves = [(0, 0), (1, 0), (0, 1), (1, 1)]
            index = indexList.pop(0)
            wMove, hMove = moves[index]
            wJump = int(w / 2)
            hJump = int(h / 2)
            w = int(w / 2)
            h = int(h / 2)
            wOrigin += wMove * wJump
            hOrigin += hMove * hJump

        # markup on the original image
        newImage = image[hOrigin:hOrigin + hJump, wOrigin:wOrigin + wJump]
        cv2.rectangle(sourceImage,
                      (wOrigin, hOrigin),
                      (wOrigin + wJump, hOrigin + hJump),
                      (255, 100, 0), 8)

        # saving sections
        name = sensorPath+''.join(nameList) + ".jpg"
        names.append(name)
        cv2.imwrite(name, newImage)

    # drawing the grid on the original image
    wSection = int(w_ / 2 ** depth)
    hSection = int(h_ / 2 ** depth)

    for i in range(2 ** depth):
        cv2.line(sourceImage, (i * wSection, 0),
                 (i * wSection, h_),
                 (200, 200, 200), 1)
        cv2.line(sourceImage, (0, i * hSection),
                 (w_, i * hSection),
                 (200, 200, 200), 1)

    # saving the final processed image on disk
    cv2.imwrite((sensorPath+"final.jpg"), sourceImage)
    return (names)



def imageClassifier():
    # an adaption of Inception image classifier to
    # detect fabrication flaws
    # https://github.com/tensorflow/models/tree/master/research/inception

    size = 4
    label_lines = [line.rstrip() for line
                   in tf.gfile.GFile(retrainedLabels)]

    with tf.gfile.FastGFile(retrainedGraph, 'rb') as f:
        graph_def = tf.GraphDef()
        graph_def.ParseFromString(f.read())
        ####################################################
        # just a hacky way to solve version discrpancies
        # if using older versions of Tensorflow,
        # remove this line!
        del (graph_def.node[1].attr["dct_method"])
        ####################################################
        _ = tf.import_graph_def(graph_def, name='')

    # running session is the heaviest task in the function
    # so, it will be called once, and all the search algorithm
    # runs inside of it in one session

    with tf.Session() as sess:
        # Feed the image_data as input to the graph and get first prediction
        softmax_tensor = sess.graph.get_tensor_by_name('final_result:0')

        image = cv2.imread(imagePath)
        root = TreeNode(image, index=0)

        # quad tree search algorithm
        def quadSearch(image, treeNode, depth):

            parent = treeNode
            print("Depth#{}".format(depth))
            resolution = 32
            depth += 1

            tags = []
            status = []

            h, w, _ = image.shape
            r = int(h / 2)
            c = int(w / 2)
            if r < resolution:
                return False

            # slicing images
            img0 = image[:r, :c]
            img1 = image[:r, c:]
            img2 = image[r:, :c]
            img3 = image[r:, c:]

            imgs = [img0, img1, img2, img3]

            nodes = []
            # adding image sections as a tree element
            for i in range(4):
                nodes.append(TreeNode(imgs[i], index=i, parent=parent, depth=depth))

            # write images on disk, to read it back in Tensorflow format
            cv2.imwrite("tfImg0.jpg", img0)
            cv2.imwrite("tfImg1.jpg", img1)
            cv2.imwrite("tfImg2.jpg", img2)
            cv2.imwrite("tfImg3.jpg", img3)
            tfImgs = []

            # reading in Tensorflow format
            tfImgs.append(tf.gfile.FastGFile("tfImg0.jpg", 'rb').read())
            tfImgs.append(tf.gfile.FastGFile("tfImg1.jpg", 'rb').read())
            tfImgs.append(tf.gfile.FastGFile("tfImg2.jpg", 'rb').read())
            tfImgs.append(tf.gfile.FastGFile("tfImg3.jpg", 'rb').read())
            counter = 0

            # iterating over images
            for i in range(4):

                counter += 1
                # prediction for image
                predictions = sess.run(softmax_tensor, \
                                       {'DecodeJpeg/contents:0': tfImgs[i]})

                # Sort to show labels of first prediction in order of confidence
                top_k = predictions[0].argsort()[-len(predictions[0]):][::-1]
                human_string = label_lines[top_k[0]]
                score = predictions[0][top_k[0]]
                thisStatus = "pass"

                # checking if it is pass or fail case
                if (human_string != "pass" or score < rateThreshold):
                    thisStatus = "fail"
                    print(human_string, counter)
                    o = str(int(random.randint(1, 9)))
                    date_string = str(depth) + o + "_" + human_string + time.strftime("_%M_%S") + ".jpg"
                status.append(thisStatus)
                tags.append(human_string)

            for i in range(4):
                if (status[i] != "pass" and imgs[i].shape[0] > resolution):
                    nodes[i].label = status[i]
                    nodes[i].tag = tags[i]
                    quadSearch(imgs[i], nodes[i], depth)
            return (root)
        # returning graph node
        return (quadSearch(image, root, 0))


def readImage():
    # reads image from the camera and write it on the disk
    # temporarily it's loaded on a web host
    # clean up the folder first
    for the_file in os.listdir(sensorPath):
        file_path = os.path.join(sensorPath, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(e)

    url = "https://image.ibb.co/jEcBub/GOPR2856.jpg"
    img = urllib.request.urlretrieve(url, imagePath)
    return (cv2.imread(imagePath))


def bfsOrder(graph):
    # breath first search on the tree
    deepest = 0
    leaves = []
    result = []
    stack = [graph]
    # iteratively going over the leaves
    while (len(stack) != 0 ):
        tmpNode = stack[0]
        stack = stack[1:]
        result.append(tmpNode.index)
        children = tmpNode.children
        for child in children:
            if child != None and child.label == "fail":
                if child.depth > deepest:
                    deepest = child.depth
                    leaves = []
                if child.depth == deepest:
                    leaves.append(child)
                stack.append(child)

    return result, leaves


class TreeNode(object):
    # a simple tree implementation
    def __init__(self,
                 image,
                 tag=None,
                 label=None,
                 index=None,
                 parent=None,
                 depth=None):
        # first set the tag
        self.image = image
        if parent == None:
            self.parent = None
            self.index = str(index)
            self.depth = 0

        else:
            if index == None:
                return False
            self.parent = parent
            self.parent.children[index] = self
            self.depth = depth

        if (self.parent):
            self.index = self.parent.index + "|" + str(index)
        if label == None:
            self.label = "pass"
        else:
            self.label = label
        if tag == None:
            self.tag = ""
        else:
            self.tag = tag
        self.children = [None for i in range(4)]

    def __str__(self):
        return self.index

    def __hash__(self):
        return (hash(self.index))